import { z } from "zod";

const coursePurchaseSchema = z.object({
  course: z.coerce.number().int().positive().min(1, "Course is required"),
  user: z.coerce.number().int().positive().min(1, "User is required"),
});

function validateCoursePurchaseRecord(object: any) {
  try {
    return coursePurchaseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}
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

const checkPurchaseSchema = z.object({
  user: z.coerce.number().int().positive(),
  course: z.coerce.number().int().positive(),
});

const listPurchasesSchema = z.object({
  user: z.coerce.number().int().positive(),
});

function validateCheckPurchase(object: any) {
  try {
    return checkPurchaseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

function validatelistPurchases(object: any) {
  try {
    return listPurchasesSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}

export { checkPurchaseSchema, listPurchasesSchema };

export {
  validateCheckPurchase,
  validatelistPurchases,
  validateSearchByQuery,
  validateCoursePurchaseRecord,
};
