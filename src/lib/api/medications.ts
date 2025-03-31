const FDA_API_BASE = 'https://api.fda.gov/drug';

export interface DrugSearchResult {
  brand_name: string;
  generic_name: string;
  route: string;
  dosage_form: string;
  active_ingredients: {
    name: string;
    strength: string;
  }[];
}

export async function searchMedications(query: string): Promise<DrugSearchResult[]> {
  if (!query || query.length < 2) return [];
  
  try {
    const response = await fetch(
      `${FDA_API_BASE}/ndc.json?search=brand_name:${query}+generic_name:${query}&limit=10`
    );
    const data = await response.json();
    
    return data.results.map((result: any) => ({
      brand_name: result.brand_name,
      generic_name: result.generic_name,
      route: result.route,
      dosage_form: result.dosage_form,
      active_ingredients: result.active_ingredients || []
    }));
  } catch (error) {
    console.error('Error searching medications:', error);
    return [];
  }
} 