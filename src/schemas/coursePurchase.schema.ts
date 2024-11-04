import { z } from "zod";

const coursePurchaseSchema = z.object({
  course: z.number().min(1, "Course is required"),
  user: z.number().min(1, "User is required"),
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
    course: z.string().refine((value) => /^\d+$/.test(value)),
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
  if (!object.startDate && !object.endDate && !object.course) {
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
    if (parsedData.course) {
      const courseId = Number(parsedData.course);
      /*   if (!isNaN(courseId)) {
        query.course = { id: courseId };
      } */
    }

    return query;
  } catch (error: any) {
    throw error;
  }
}
//Esto no me parece que esta de mas, no deberia poder editarse la compra de un curso
/* 
const coursePurchaseToPatchSchema = z.object({
  course: z.number().optional(),
  user: z.number().optional(),
});

function validateCoursePurchaseRecordToPatch(object: any) {
  try {
    return coursePurchaseToPatchSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
} 
*/
export {
  //validateCoursePurchaseRecordToPatch,
  validateSearchByQuery,
  validateCoursePurchaseRecord,
};
