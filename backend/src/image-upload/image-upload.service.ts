import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

interface Album {
  id: number;
  name: string;
  parentId: number | null;
  isPublic: boolean;
  createdAt: string;
  children?: Album[];
}

interface UploadResult {
  success: boolean;
  fileId?: number;
  fileName?: string;
  url?: string;
  error?: string;
}

@Injectable()
export class ImageUploadService {
  private readonly logger = new Logger(ImageUploadService.name);
  private readonly apiUrl: string;
  private readonly apiToken: string;

  constructor(private readonly configService: ConfigService) {
    this.apiUrl = this.configService.get<string>('IMAGE_API_URL') || 'http://localhost:3000/api';
    this.apiToken = this.configService.get<string>('IMAGE_API_TOKEN') || '';
  }

  /**
   * Generate next filename number for album
   * Format: 1.png, 2.png, etc. (per folder)
   */
  private async generateNextFilename(albumId: number, originalName: string): Promise<string> {
    // Get existing files in album
    const existingFiles = await this.listFilesInAlbum(albumId);
    
    // Extract numbers from existing filenames (e.g., "1.png" -> 1)
    const numbers = existingFiles
      .map(f => {
        const match = f.name.match(/^(\d+)\.\w+$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);
    
    // Find next available number
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    
    // Get file extension from original
    const ext = originalName.split('.').pop() || 'png';
    
    return `${nextNumber}.${ext.toLowerCase()}`;
  }

  /**
   * List files in an album
   */
  private async listFilesInAlbum(albumId: number): Promise<Array<{ id: number; publicId: string; name: string }>> {
    try {
      const response = await fetch(
        `${this.apiUrl}/files?albumId=${albumId}&size=1000`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        return [];
      }

      const result = await response.json();
      return result.content || [];
    } catch (error) {
      this.logger.warn(`Failed to list files in album ${albumId}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get or create album structure: [sex]/[ethnicity]
   */
  async getOrCreateAlbumPath(sex: string, ethnicity: string): Promise<number> {
    // Normalize names for folder names
    const normalizedSex = this.normalizeFolderName(sex);
    const normalizedEthnicity = this.normalizeFolderName(ethnicity);

    // Get all albums
    const albums = await this.listAlbums();

    // Find or create sex album
    let sexAlbum = albums.find(a => a.name.toLowerCase() === normalizedSex.toLowerCase());
    if (!sexAlbum) {
      this.logger.log(`Creating sex album: ${normalizedSex}`);
      sexAlbum = await this.createAlbum(normalizedSex, null);
    }

    // Find or create ethnicity sub-album
    const ethnicityAlbums = await this.getAlbumChildren(sexAlbum.id);
    let ethnicityAlbum = ethnicityAlbums.find(
      a => a.name.toLowerCase() === normalizedEthnicity.toLowerCase()
    );
    if (!ethnicityAlbum) {
      this.logger.log(`Creating ethnicity album: ${normalizedEthnicity} under ${normalizedSex}`);
      ethnicityAlbum = await this.createAlbum(normalizedEthnicity, sexAlbum.id);
    }

    return ethnicityAlbum.id;
  }

  /**
   * Upload image file to specific album
   */
  async uploadImage(
    file: UploadedFile,
    sex: string,
    ethnicity: string,
    fileName?: string
  ): Promise<UploadResult> {
    try {
      // Get or create album path
      const albumId = await this.getOrCreateAlbumPath(sex, ethnicity);

      // Get next available filename number for this album
      const uniqueFileName = await this.generateNextFilename(albumId, file.originalname);

      // Create FormData
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype });
      formData.append('file', blob, uniqueFileName);
      formData.append('albumId', albumId.toString());

      // Upload to external API
      const response = await fetch(`${this.apiUrl}/files/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      // Make file public
      await this.setFilePublic(result.id, true);
      
      this.logger.log(`Image uploaded successfully: ${result.id} (publicId: ${result.publicId}) as ${uniqueFileName} to album ${albumId}`);

      return {
        success: true,
        fileId: result.id,
        fileName: uniqueFileName,
        url: `${this.apiUrl}/files/view/${result.publicId}?variant=original`,
      };
    } catch (error) {
      this.logger.error(`Failed to upload image: ${error.message}`);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get a random image URL for a specific sex and ethnicity
   */
  async getRandomImageForPerson(
    sex: string,
    ethnicity: string,
    variant: 'thumb' | 'medium' | 'original' = 'medium'
  ): Promise<string | null> {
    try {
      // Normalize names
      const normalizedSex = this.normalizeFolderName(sex);
      const normalizedEthnicity = this.normalizeFolderName(ethnicity);

      // Get all albums
      const albums = await this.listAlbums();

      // Find sex album
      const sexAlbum = albums.find(a => a.name.toLowerCase() === normalizedSex.toLowerCase());
      if (!sexAlbum) {
        this.logger.log(`No sex album found for: ${normalizedSex}`);
        return null;
      }

      // Find ethnicity sub-album
      const ethnicityAlbums = await this.getAlbumChildren(sexAlbum.id);
      const ethnicityAlbum = ethnicityAlbums.find(
        a => a.name.toLowerCase() === normalizedEthnicity.toLowerCase()
      );
      if (!ethnicityAlbum) {
        this.logger.log(`No ethnicity album found for: ${normalizedEthnicity} under ${normalizedSex}`);
        return null;
      }

      // List files in the ethnicity album
      const files = await this.listFilesInAlbum(ethnicityAlbum.id);
      if (files.length === 0) {
        this.logger.log(`No images found in album: ${normalizedSex}/${normalizedEthnicity}`);
        return null;
      }

      // Pick random file
      const randomFile = files[Math.floor(Math.random() * files.length)];
      
      this.logger.log(`Selected random image ${randomFile.name} (publicId: ${randomFile.publicId}) for ${sex}/${ethnicity}`);
      
      return `${this.apiUrl}/files/view/${randomFile.publicId}?variant=${variant}`;
    } catch (error) {
      this.logger.error(`Failed to get random image: ${error.message}`);
      return null;
    }
  }

  /**
   * List all albums
   */
  private async listAlbums(): Promise<Album[]> {
    try {
      const response = await fetch(`${this.apiUrl}/albums`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to list albums: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to list albums: ${error.message}`);
      return [];
    }
  }

  /**
   * Get children of an album
   */
  private async getAlbumChildren(albumId: number): Promise<Album[]> {
    try {
      const response = await fetch(`${this.apiUrl}/albums/${albumId}/children`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get album children: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      this.logger.error(`Failed to get album children: ${error.message}`);
      return [];
    }
  }

  /**
   * Create a new album
   */
  private async createAlbum(name: string, parentId: number | null): Promise<Album> {
    const response = await fetch(`${this.apiUrl}/albums`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        parentId,
        isPublic: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to create album: ${response.status} - ${errorText}`);
    }

    return await response.json();
  }

  /**
   * Set file visibility (public/private)
   */
  private async setFilePublic(fileId: number, isPublic: boolean): Promise<void> {
    try {
      const response = await fetch(
        `${this.apiUrl}/files/${fileId}/visibility?isPublic=${isPublic}`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
          },
        }
      );

      if (!response.ok) {
        this.logger.warn(`Failed to set file ${fileId} visibility: ${response.status}`);
      }
    } catch (error) {
      this.logger.warn(`Failed to set file ${fileId} visibility: ${error.message}`);
    }
  }

  /**
   * Normalize folder name
   */
  private normalizeFolderName(name: string): string {
    return name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\-_]/g, '_')
      .toLowerCase();
  }

  /**
   * Get image URL with variant
   */
  getImageUrl(publicId: string, variant: 'thumb' | 'medium' | 'original' = 'original'): string {
    return `${this.apiUrl}/files/view/${publicId}?variant=${variant}`;
  }
}
