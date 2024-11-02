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

const searchByCourseSchema = z.object({
  course: z.number().min(1, "Course is required"),
});

function validateSearchByCourse(object: any) {
  try {
    return searchByCourseSchema.parse(object);
  } catch (error: any) {
    throw error;
  }
}
const searchByDateRangeSchema = z
  .object({
    startDate: z.string().nonempty("startDate must be defined"),
    endDate: z.string().nonempty("endDate must be defined"),
  })
  .refine((data) => {
    const { startDate, endDate } = data;
    return new Date(endDate) >= new Date(startDate);
  }, {
    message: "endDate must be greater than or equal to startDate",
    path: ["endDate"],
  });
function validateSearchByDateRange(object: any) {
  try {
    return searchByDateRangeSchema.parse(object);
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
  validateSearchByDateRange,
  validateSearchByCourse,
  validateCoursePurchaseRecord,
};
