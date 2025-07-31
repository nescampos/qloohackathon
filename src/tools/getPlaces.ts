import type { ToolConfig } from "../utils/toolConfig";
import axios from "axios";


export interface GetPlacesArgs {
  city: string;
  wifi?: string;
  is_shopping?: string;
  credit_card?: string;
  is_tourist?: string;
  free_parking?: string;
  alcohol?: string;
  coffee?: string;
  is_market?: string;
  free_admission?: string;
  has_restroom?: string;
  dog_park?: string;
  is_park?: string;
  kids_playground?: string;
  is_hotel?: string;
  smoke_free?: string;
  cultural_center?: string;
}

export const getPlacesTool: ToolConfig<GetPlacesArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_places",
      description: "Retorna un listado de lugares en una ciudad específica de acuerdo a distintos detalles y filtros.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "La ciudad donde buscar lugares",
          },
          is_shopping: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean tiendas comerciales. Ejemplos: 'tenga tiendas comerciales', 'tiendas comerciales con tiendas comerciales', 'lugares comerciales con tiendas comerciales'. Si el usuario no menciona nada sobre tiendas comerciales, omite este parámetro.",
          },
          wifi: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan wifi. Ejemplos: 'tenga wifi', 'lugares con wifi', 'lugares comerciales con wifi'. Si el usuario no menciona nada sobre wifi, omite este parámetro.",
          },
          credit_card: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan aceptación de tarjeta de crédito. Ejemplos: 'acepte tarjeta de crédito', 'lugares que acepten tarjeta de crédito', 'lugares que acepten tarjeta de crédito'. Si el usuario no menciona nada sobre tarjeta de crédito, omite este parámetro.",
          },
          is_tourist: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean atracciones turísticas. Ejemplos: 'tenga atracciones turísticas', 'lugares con atracciones turísticas', 'lugares turísticos con atracciones turísticas'. Si el usuario no menciona nada sobre atracciones turísticas, omite este parámetro.",
          },
          free_parking: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan parqueo gratuito. Ejemplos: 'tenga parqueo gratuito', 'lugares con parqueo gratuito', 'lugares turísticos con parqueo gratuito'. Si el usuario no menciona nada sobre parqueo gratuito, omite este parámetro.",
          },
          alcohol: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan alcohol. Ejemplos: 'tenga alcohol', 'lugares con alcohol', 'lugares turísticos con alcohol'. Si el usuario no menciona nada sobre alcohol, omite este parámetro.",
          },
          coffee: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan café. Ejemplos: 'tenga café', 'lugares con café', 'lugares turísticos con café'. Si el usuario no menciona nada sobre café, omite este parámetro.",
          },
          is_market: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean mercados. Ejemplos: 'tenga mercado', 'lugares con mercado', 'lugares turísticos con mercado'. Si el usuario no menciona nada sobre mercado, omite este parámetro.",
          },
          free_admission: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan admisión gratuita. Ejemplos: 'tenga admisión gratuita', 'lugares con admisión gratuita', 'lugares turísticos con admisión gratuita'. Si el usuario no menciona nada sobre admisión gratuita, omite este parámetro.",
          },
          has_restroom: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan baño. Ejemplos: 'tenga baño', 'lugares con baño', 'lugares turísticos con baño'. Si el usuario no menciona nada sobre baño, omite este parámetro.",
          },
          dog_park: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan parque para perros. Ejemplos: 'tenga parque para perros', 'lugares con parque para perros', 'lugares turísticos con parque para perros'. Si el usuario no menciona nada sobre parque para perros, omite este parámetro.",
          },
          is_park: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean parques. Ejemplos: 'tenga parque', 'lugares con parque', 'lugares turísticos con parque'. Si el usuario no menciona nada sobre parque, omite este parámetro.",
          },
          kids_playground: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que tengan parque o juegos para niños. Ejemplos: 'tenga parque para niños', 'lugares con parque para niños', 'lugares turísticos con parque para niños'. Si el usuario no menciona nada sobre parque para niños, omite este parámetro.",
          },
          is_hotel: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean hoteles. Ejemplos: 'sea hotel', 'lugares con hotel', 'lugares turísticos con hotel'. Si el usuario no menciona nada sobre hotel, omite este parámetro.",
          },
          smoke_free: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean libres de fumadores. Ejemplos: 'sea libre de fumadores', 'lugares libre de fumadores', 'lugares turísticos libre de fumadores'. Si el usuario no menciona nada sobre libre de fumadores, omite este parámetro.",
          },
          cultural_center: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por lugares que sean centros culturales. Ejemplos: 'centro cultural', 'sea centro cultural', 'lugares con centro cultural'. Si el usuario no menciona nada sobre centro cultural, omite este parámetro.",
          },
        },
        required: ["city"], 
      },
    },
  },
  handler: async ({ city, wifi, is_shopping, credit_card, is_tourist, free_parking, alcohol, coffee, is_market, free_admission, has_restroom, dog_park, is_park, kids_playground, is_hotel, smoke_free, cultural_center }) => {
    return await askQloo(city, wifi, is_shopping, credit_card, is_tourist, free_parking, alcohol, coffee, is_market, free_admission, has_restroom, dog_park, is_park, kids_playground, is_hotel, smoke_free, cultural_center);
  },
};

async function askQloo(city : string, wifi?: string, is_shopping?: string, credit_card?: string, is_tourist?: string, free_parking?: string, alcohol?: string, coffee?: string, is_market?: string, free_admission?: string, has_restroom?: string, dog_park?: string, is_park?: string, kids_playground?: string, is_hotel?: string, smoke_free?: string, cultural_center?: string) {

  let wifiAvailable = wifi !== undefined && wifi.toLowerCase() == 'true' ? ",urn:tag:amenity:place:wi_fi" : "";
  let isShopping = is_shopping !== undefined && is_shopping.toLowerCase() == 'true' ? ",urn:tag:genre:place:shopping_mall" : "";
  let acceptCredit = credit_card !== undefined && credit_card.toLowerCase() == 'true' ? ",urn:tag:payments:place:credit_cards" : "";
  let isTourist = is_tourist !== undefined && is_tourist.toLowerCase() == 'true' ? ",urn:tag:category:place:tourist_attraction" : "";
  let freeParking = free_parking !== undefined && free_parking.toLowerCase() == 'true' ? ",urn:tag:parking:place:free_parking_lot" : "";
  let hasAlcohol = alcohol !== undefined && alcohol.toLowerCase() == 'true' ? ",urn:tag:offerings:place:alcohol" : "";
  let hasCoffee = coffee !== undefined && coffee.toLowerCase() == 'true' ? ",urn:tag:offerings:place:coffee" : "";
  let isMarket = is_market !== undefined && is_market.toLowerCase() == 'true' ? ",urn:tag:genre:place:market" : "";
  let freeAdmission = free_admission !== undefined && free_admission.toLowerCase() == 'true' ? ",urn:tag:planning:place:has_free_admission" : "";
  let hasRestroom = has_restroom !== undefined && has_restroom.toLowerCase() == 'true' ? ",urn:tag:amenity:place:restroom" : "";
  let dogPark = dog_park !== undefined && dog_park.toLowerCase() == 'true' ? ",urn:tag:pets:place:dog_park" : "";
  let isPark = is_park !== undefined && is_park.toLowerCase() == 'true' ? ",urn:tag:category:place:park" : "";
  let kidsPlayground = kids_playground !== undefined && kids_playground.toLowerCase() == 'true' ? ",urn:tag:children:place:playground" : "";
  let isHotel = is_hotel !== undefined && is_hotel.toLowerCase() == 'true' ? ",urn:tag:category:place:hotel" : "";
  let smokeFree = smoke_free !== undefined && smoke_free.toLowerCase() == 'true' ? ",urn:tag:amenity:place:smoke_free" : "";
  let culturalCenter = cultural_center !== undefined && cultural_center.toLowerCase() == 'true' ? ",urn:tag:genre:place:cultural_center" : "";

  const targetPath = `${process.env.QLOO_ENDPOINT}/v2/insights/?filter.type=urn:entity:place&filter.location.query=${city}&filter.exclude.tags=urn:tag:genre:place:restaurant&filter.tags=${isShopping}${wifiAvailable}${acceptCredit}${isTourist}${freeParking}${hasAlcohol}${hasCoffee}${isMarket}${freeAdmission}${hasRestroom}${dogPark}${isPark}${kidsPlayground}${isHotel}${smokeFree}${culturalCenter}&take=5`;
  const targetPathConfig = {
        headers: {
            'X-Api-Key': process.env.QLOO_API_KEY,
            "accept": 'application/json'
        }
  };
  try {
        const {data} = await axios.get(
            targetPath,
            targetPathConfig
        );
        // Return the tokens available for the account
        var results = data.results.entities;
        if (!results || results.length === 0) {
            return "No se encontraron lugares con esos criterios.";
        }
        return results.map((restaunt: any, idx: number) => `
${idx+1}. ${restaunt.name}
   Descripción: ${restaunt.properties.description || 'No disponible'}
   Estado: ${restaunt.properties.is_closed ? 'Cerrado' : 'Abierto'}
   Dirección: ${restaunt.properties.address || 'No disponible'}
   Teléfono: ${restaunt.properties.phone || 'No disponible'}
   Web: ${restaunt.properties.website || 'No disponible'}
`).join("\n");

    } catch (error) {
        throw(error);
    };
}
