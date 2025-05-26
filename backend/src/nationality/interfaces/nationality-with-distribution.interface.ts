export interface NationalityWithDistribution {
  id: string;
  nameEn: string;
  nameFr: string;
  ethnicities: Array<{
    id: string;
    nameEn: string;
    nameFr: string;
    percentage: number;
  }>;
}
