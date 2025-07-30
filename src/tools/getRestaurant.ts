import type { ToolConfig } from "../utils/toolConfig";
import axios from "axios";


export interface GetRestaurantArgs {
  city: string;
  cuisine?: string;
  dogs_allowed?: string;
  kids_menu?: string;
  vegan?: string;
  delivery?: string;
  vegetarian?: string;
  credit_card?: string;
  bar?: string;
  free_parking?: string;
  alcohol?: string;
  coffee?: string;
  dinner?: string;
  lunch?: string;
  breakfast?: string;
  dessert?: string;
  brunch?: string;
}

export const getRestaurantTool: ToolConfig<GetRestaurantArgs> = {
  definition: {
    type: "function",
    function: {
      name: "get_restaurant",
      description: "Retorna un listado de restaurantes en una ciudad específica de acuerdo a distintos detalles y filtros.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "La ciudad donde buscar restaurantes",
          },
          cuisine: {
            type: "string",
            description: "El tipo de comida o cocina que se desea buscar (china, italiana,india, etc.). Retorna el valor en inglés, por ejemplo, si el usuario te dice italiana, retorna italian.",
          },
          dogs_allowed: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que acepten mascotas, perros, o sean pet-friendly. Ejemplos: 'acepten perros', 'lugares pet-friendly', 'restaurantes que permitan mascotas'. Si el usuario no menciona nada sobre mascotas, omite este parámetro.",
          },
          kids_menu: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan menú para niños. Ejemplos: 'tenga menú infantil', 'restaurantes con menú infantil', 'lugares con menú para niños'. Si el usuario no menciona nada sobre menú para niños, omite este parámetro.",
          },
          vegan: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan menú vegano. Ejemplos: 'tenga menú vegano', 'restaurantes con menú vegano', 'lugares con menú vegano'. Si el usuario no menciona nada sobre menú vegano, omite este parámetro.",
          },
          vegetarian: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan menú vegetariano. Ejemplos: 'tenga menú vegetariano', 'restaurantes con menú vegetariano', 'lugares con menú vegetariano'. Si el usuario no menciona nada sobre menú vegetariano, omite este parámetro.",
          },
          delivery: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan delivery o entregas a domicilio. Ejemplos: 'tenga delivery', 'restaurantes con entrega a domicilio', 'lugares con delivery'. Si el usuario no menciona nada sobre delivery, omite este parámetro.",
          },
          credit_card: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan aceptación de tarjeta de crédito. Ejemplos: 'acepte tarjeta de crédito', 'restaurantes que acepten tarjeta de crédito', 'lugares que acepten tarjeta de crédito'. Si el usuario no menciona nada sobre tarjeta de crédito, omite este parámetro.",
          },
          bar: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan bar. Ejemplos: 'tenga bar', 'restaurantes con bar', 'lugares con bar'. Si el usuario no menciona nada sobre bar, omite este parámetro.",
          },
          free_parking: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan parqueo gratuito. Ejemplos: 'tenga parqueo gratuito', 'restaurantes con parqueo gratuito', 'lugares con parqueo gratuito'. Si el usuario no menciona nada sobre parqueo gratuito, omite este parámetro.",
          },
          alcohol: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan alcohol. Ejemplos: 'tenga alcohol', 'restaurantes con alcohol', 'lugares con alcohol'. Si el usuario no menciona nada sobre alcohol, omite este parámetro.",
          },
          coffee: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan café. Ejemplos: 'tenga café', 'restaurantes con café', 'lugares con café'. Si el usuario no menciona nada sobre café, omite este parámetro.",
          },
          dinner: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan cena. Ejemplos: 'tenga cena', 'restaurantes con cena', 'lugares con cena'. Si el usuario no menciona nada sobre cena, omite este parámetro.",
          },
          lunch: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan almuerzo. Ejemplos: 'tenga almuerzo', 'restaurantes con almuerzo', 'lugares con almuerzo'. Si el usuario no menciona nada sobre almuerzo, omite este parámetro.",
          },
          breakfast: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan desayuno. Ejemplos: 'tenga desayuno', 'restaurantes con desayuno', 'lugares con desayuno'. Si el usuario no menciona nada sobre desayuno, omite este parámetro.",
          },
          dessert: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan postres. Ejemplos: 'tenga postre', 'restaurantes con postres', 'lugares con postres'. Si el usuario no menciona nada sobre postres, omite este parámetro.",
          },
          brunch: {
            type: "string",
            description: "Establece este parámetro en 'true' cuando el usuario pregunte específicamente por restaurantes que tengan brunch. Ejemplos: 'tenga brunch', 'restaurantes con brunch', 'lugares con brunch'. Si el usuario no menciona nada sobre brunch, omite este parámetro.",
          },
        },
        required: ["city"], 
      },
    },
  },
  handler: async ({ city, cuisine, dogs_allowed, kids_menu, vegan, delivery, vegetarian, credit_card, bar, free_parking, alcohol, coffee, dinner, lunch, breakfast, dessert, brunch }) => {
    return await askQloo(city, cuisine, dogs_allowed, kids_menu, vegan, delivery, vegetarian, credit_card, bar, free_parking, alcohol, coffee, dinner, lunch, breakfast, dessert, brunch);
  },
};

async function askQloo(city : string, cuisine?: string, dogs_allowed?: string, kids_menu?: string, vegan?: string, delivery?: string, vegetarian?: string, credit_card?: string, bar?: string, free_parking?: string, alcohol?: string, coffee?: string, dinner?: string, lunch?: string, breakfast?: string, dessert?: string, brunch?: string) {

  let restaurtantType = cuisine ? ":"+cuisine : "";
  let dogsAllowed = dogs_allowed !== undefined && dogs_allowed.toLowerCase() == 'true' ? ",urn:tag:pets:place:dogs_allowed" : "";
  let kidsMenuAvailable = kids_menu !== undefined && kids_menu.toLowerCase() == 'true' ? ",urn:tag:children:place:kids_menu" : "";
  let hasVegan = vegan !== undefined && vegan.toLowerCase() == 'true' ? ",urn:tag:offerings:place:vegan_options" : "";
  let hasDelivery = delivery !== undefined && delivery.toLowerCase() == 'true' ? ",urn:tag:service_options:place:delivery" : "";
  let hasVegetarian = vegetarian !== undefined && vegetarian.toLowerCase() == 'true' ? ",urn:tag:offerings:place:vegetarian_options" : "";
  let acceptCredit = credit_card !== undefined && credit_card.toLowerCase() == 'true' ? ",urn:tag:payments:place:credit_cards" : "";
  let hasBar = bar !== undefined && bar.toLowerCase() == 'true' ? ",urn:tag:amenity:place:bar_onsite" : "";
  let freeParking = free_parking !== undefined && free_parking.toLowerCase() == 'true' ? ",urn:tag:parking:place:free_parking_lot" : "";
  let hasAlcohol = alcohol !== undefined && alcohol.toLowerCase() == 'true' ? ",urn:tag:offerings:place:alcohol" : "";
  let hasCoffee = coffee !== undefined && coffee.toLowerCase() == 'true' ? ",urn:tag:offerings:place:coffee" : "";
  let hasDinner = dinner !== undefined && dinner.toLowerCase() == 'true' ? ",urn:tag:dining_options:place:dinner" : "";
  let hasLunch = lunch !== undefined && lunch.toLowerCase() == 'true' ? ",urn:tag:dining_options:place:lunch" : "";
  let hasBreakfast = breakfast !== undefined && breakfast.toLowerCase() == 'true' ? ",urn:tag:dining_options:place:breakfast" : "";
  let hasDessert = dessert !== undefined && dessert.toLowerCase() == 'true' ? ",urn:tag:dining_options:place:dessert" : "";
  let hasBrunch = brunch !== undefined && brunch.toLowerCase() == 'true' ? ",urn:tag:dining_options:place:brunch" : "";

  const targetPath = `${process.env.QLOO_ENDPOINT}/v2/insights/?filter.type=urn:entity:place&filter.location.query=${city}&filter.tags=urn:tag:genre:place:restaurant${restaurtantType}${dogsAllowed}${kidsMenuAvailable}${hasVegan}${hasDelivery}${hasVegetarian}${acceptCredit}${hasBar}${freeParking}${hasAlcohol}${hasCoffee}${hasDinner}${hasLunch}${hasBreakfast}${hasDessert}${hasBrunch}&take=5`;
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
            return "No se encontraron restaurantes con esos criterios.";
        }
        return results.map((restaunt: any, idx: number) => `
${idx+1}. ${restaunt.name}
   Estado: ${restaunt.properties.is_closed ? 'Cerrado' : 'Abierto'}
   Dirección: ${restaunt.properties.address || 'No disponible'}
   Teléfono: ${restaunt.properties.phone || 'No disponible'}
   Web: ${restaunt.properties.website || 'No disponible'}
   Tipo de cocina: ${(restaunt.properties.cuisine && restaunt.properties.cuisine.length > 0) ? restaunt.properties.cuisine.join(', ') : 'No especificado'}
`).join("\n");

    } catch (error) {
        throw(error);
    };
}
