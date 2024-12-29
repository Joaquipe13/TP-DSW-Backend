import { z } from "zod";

const searchByQuerySchema = z
  .object({
    startDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          return !date || !isNaN(Date.parse(date));
        },
        {
          message: "startDate must be a valid date",
        }
      ),
    endDate: z
      .string()
      .optional()
      .refine(
        (date) => {
          return !date || !isNaN(Date.parse(date));
        },
        {
          message: "endDate must be a valid date",
        }
      ),
    user: z.coerce.number().int().positive().optional(),
  })
  .refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "endDate must be greater than or equal to startDate",
      path: ["endDate"],
    }
  );
function validateSearchByQuery(object: any) {
  if (!object.startDate && !object.endDate && !object.user) {
    return undefined;
  }
  try {
    const parsedData = searchByQuerySchema.parse(object);

    const query: any = {};
    if (parsedData.startDate && parsedData.endDate) {
      query.purchaseAt = {
        $gte: new Date(parsedData.startDate),
        $lte: new Date(parsedData.endDate),
      };
    } else if (parsedData.startDate) {
      query.purchaseAt = { $gte: new Date(parsedData.startDate) };
    } else if (parsedData.endDate) {
      query.purchaseAt = { $lte: new Date(parsedData.endDate) };
    }
    if (parsedData.user) {
      query.user = parsedData.user;
    }
    return query;
  } catch (error: any) {
    throw error;
  }
}

const listPurchasesSchema = z.object({
    user: z.coerce.number().int().positive(),
  });
  
  function validateListPurchases(object: any) {
    try {
      return listPurchasesSchema.parse(object);
    } catch (error: any) {
      throw error;
    }
  }

  export {
    validateListPurchases,
    validateSearchByQuery,
  };