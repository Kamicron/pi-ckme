interface FlagMapping {
  [key: string]: string;
}

export const useFlags = () => {
  // Mapping des nationalités en français vers les codes de drapeaux
  const flagMappings: FlagMapping = {
    "Brésilien": "Brazil",
    "Français": "France",
    "Américain": "United-States-of-America",
    "Royaume-Uni": "United-Kingdom",
    "Allemand": "Germany",
    "Italien": "Italy",
    "Espagnol": "Spain",
    "Portugais": "Portugal",
    "Japonais": "Japan",
    "Chinois": "China",
    "Indonésien":"Indonesia",
    "Iranien": "Iran",
    "Mexicain": "Mexico",
    "Nigérian": "Nigeria",
    "Philippin": "Philippines",
    "Russe": "Russia",
    "Sud-Africain": "South-Africa",
    "Turc": "Turkey",
    "Vietnamien": "Vietnam",
    "Indien": "India",
    "Australien": "Australia",
    "Égyptien": "Egypt",
    "Marocain": "Morocco",
    "Coréen": "South-Korea",
    "Canadien": "Canada",
    // Ajoutez d'autres mappings ici
  }

  /**
   * Obtient le code du drapeau à partir du nom de la nationalité
   * @param nationality Nom de la nationalité en français
   * @returns Code du drapeau ou undefined si non trouvé
   */
  const getFlagCode = (nationality: string): string | undefined => {
    return flagMappings[nationality]
  }

  /**
   * Ajoute ou met à jour un mapping de drapeau
   * @param nationality Nom de la nationalité en français
   * @param flagCode Code du drapeau
   */
  const setFlagMapping = (nationality: string, flagCode: string): void => {
    flagMappings[nationality] = flagCode
  }

  /**
   * Ajoute plusieurs mappings de drapeaux à la fois
   * @param mappings Objet contenant les mappings à ajouter
   */
  const addFlagMappings = (mappings: FlagMapping): void => {
    Object.assign(flagMappings, mappings)
  }

  /**
   * Construit l'URL complète du drapeau
   * @param nationality Nom de la nationalité en français
   * @returns URL complète du drapeau ou undefined si non trouvé
   */
  const getFlagUrl = (nationality: string): string | undefined => {
    const code = getFlagCode(nationality)
    return code ? `/img/flags/${code}.png` : undefined
  }

  return {
    getFlagCode,
    getFlagUrl,
    setFlagMapping,
    addFlagMappings
  }
}
