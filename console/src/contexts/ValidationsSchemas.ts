import * as Yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const name = Yup.string()
  .trim()
  .min(3, "Name must be at least 3 characters")
  .matches(/^(?!\s)(.*\S)?$/, "Name cannot start or end with a space")
  .required("Name is required");

const email = Yup.string().email("Invalid email").required("Email is required");

const mobile_no = Yup.string()
  .test("valid-phone", "Invalid phone number", (value) => {
    if (!value) return false;
    const phoneNumber = parsePhoneNumberFromString(
      value.startsWith("+") ? value : `+${value}`,
    );
    return phoneNumber ? phoneNumber.isValid() : false;
  })
  .required("Phone number is required");

const password = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .matches(/^\S*$/, "Password cannot contain spaces")
  .required("Password is required");

const confirm_password = Yup.string()
  .oneOf([Yup.ref("password"), undefined], "Passwords must match")
  .required("Confirm Password is required");

const terms = Yup.boolean().oneOf(
  [true],
  "You must accept the Terms & Conditions",
);

const getValidString = (field: string) => {
  return Yup.string()
    .min(3, `${field} must be at least 3 characters`)
    .matches(/^\S.*\S$/, `${field} cannot start or end with a space`)
    .required(`${field} is required`);
};
const getValidForOnlyRequired = (field: string) => {
  return Yup.string().required(`${field} is required`);
};

const role = Yup.string().required("Role is required");

export const loginSchema = Yup.object({ email, password });

export const registerSchema = Yup.object({
  name,
  email,
  mobile_no,
  password,
  confirm_password,
  terms,
});

export const ResetPasswordValidation = Yup.object({
  new_password: password,
  confirm_password: Yup.string()
    .oneOf([Yup.ref("new_password"), undefined], "Passwords must match")
    .required("Confirm Password is required"),
});

export const userCreateValidation = Yup.object({
  name,
  email,
  mobile_no,
  role,
});

export const userEditValidation = Yup.object({
  name,
  email,
  mobile_no: Yup.string().test(
    "valid-phone",
    "Invalid phone number",
    (value) => {
      if (!value) return true;
      const phoneNumber = parsePhoneNumberFromString(
        value.startsWith("+") ? value : `+${value}`,
      );
      return phoneNumber ? phoneNumber.isValid() : false;
    },
  ),
});
export const userEditByAdminValidation = Yup.object({
  name,
  email,
  mobile_no,
  role,
  status: getValidForOnlyRequired("Status"),
  permissions: Yup.array().min(1, "Select at least one permission"),
});

export const statusValidation = Yup.object({
  status_name: getValidForOnlyRequired("Status Name"),
  parent_status: getValidString("Parent Status"),
});

export const CategorySchema = Yup.object().shape({
  category_name: Yup.string().required("Category name is required"),
  parent_category: getValidForOnlyRequired("Parent category"),
});

export const BlogSchema = Yup.object().shape({
  title: getValidString("Title"),
  categories: Yup.array().min(1, "Select at least one category"),
  tags: Yup.array().min(1, "Select at least one tag"),
  content: getValidForOnlyRequired("Content"),
});

export const CourseValidation = Yup.object().shape({
  course_name: getValidString("Course name"),
  course_type: Yup.string().required("Course Type is required"),
  program_type: Yup.string().required("Program Type is required"),
  duration_value: Yup.number()
    .min(1, "Duration value must be at least 1")
    .required("Duration value is required"),
  duration_type: getValidForOnlyRequired("Duration type"),
});

export const PropertyRankingValidation = Yup.object().shape({
  naac_rank: Yup.string().required("This field is required."),
});

export const ExamValidation = Yup.object().shape({
  exam_name: getValidString("Exam name"),
  exam_short_name: getValidString("Exam name"),
  exam_mode: Yup.string().required("Exam short mode is required."),
  exam_type: Yup.string().required("Exam Type is required."),
});

export const ScholarshipValidation = Yup.object().shape({
  scholarship_title: Yup.string().required("This field is required."),
  scholarship_type: Yup.string().required("This field is required."),
});

export const PropertyCourseValidation = Yup.object().shape({
  course_name: getValidString("Course name"),
  course_type: getValidForOnlyRequired("Course type"),
  duration_value: Yup.number()
    .min(1, "Duration value must be at least 1")
    .required("Duration value is required"),
  duration_type: getValidForOnlyRequired("Duration type"),
});

export const BlogCategoryCreateSchema = Yup.object().shape({
  blog_category: getValidString("Blog Category"),
  parent_category: getValidForOnlyRequired("Parent Category"),
});

export const BlogTagValidation = Yup.object({
  blog_tag: getValidString("Blog Tag"),
});
export const KeyOutComeValidation = Yup.object({
  key_outcome: getValidString("Key Outcome"),
});
export const RequirementValidation = Yup.object({
  requirment: getValidString("Requirement"),
});
export const BestForValidation = Yup.object({
  best_for: getValidString("Best For"),
});
export const CourseEligibilityValidation = Yup.object({
  course_eligibility: getValidString("Course Eligibility"),
});
export const galleryTitleValidation = Yup.object({
  title: getValidString("Title"),
});

export const FeedBackValidation = Yup.object({
  reaction: getValidForOnlyRequired("Reaction"),
  message: getValidString("Message"),
});

export const PropertyValidation = Yup.object({
  property_name: getValidString("Property Name"),
  property_email: email,
  property_mobile_no: mobile_no,
  academic_type: getValidForOnlyRequired("Academic Type"),
  property_type: getValidForOnlyRequired("Property Type"),
});

export const FaqValidation = Yup.object({
  question: getValidString("Question"),
});

export const QnAValidation = Yup.object({
  question: getValidString("Question"),
});

export const forgotPasswordSchema = Yup.object({ email });

export const propertyBasicDetailsValidationSchema = Yup.object({
  property_alt_no: Yup.string().nullable(),
  property_website: Yup.string().url("Enter a valid URL").nullable(),
  category: getValidForOnlyRequired("Academic Type"),
  property_type: getValidForOnlyRequired("Property Type"),
  est_year: Yup.number()
    .min(1500, "Year too old")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .nullable(),
  status: getValidForOnlyRequired("Status"),
});

export const CouponValidation = Yup.object({
  coupon_code: getValidString("Coupon Code"),
  start_from: Yup.date().required("Start date is required"),
  valid_upto: Yup.date().required("End date is required"),
  discount: Yup.number()
    .required("Discount is required")
    .min(0, "Discount cannot be negative")
    .max(100, "Discount cannot exceed 100"),
});

export const ReviewValidation = Yup.object({
  name: getValidString("Name"),
  rating: Yup.number()
    .required("Rating is required")
    .min(1, "Minimum 1")
    .max(5, "Maximum 5"),
  review: Yup.string()
    .required("Review is required")
    .max(1500, "Maximum 1500 characters"),
});

export const SeoValidation = Yup.object({
  title: getValidString("Title"),
  slug: getValidString("Slug"),
  primary_focus_keyword: Yup.array()
    .of(
      Yup.object({
        label: Yup.string().required("Keyword label is required"),
        value: Yup.string().required("Keyword value is required"),
      }),
    )
    .min(1, "At least one keyword is required")
    .max(2, "You can add only up to 2 keywords"),
  meta_description: Yup.string()
    .max(160, "Meta Description should not exceed 160 characters.")
    .required("Meta Description is required for SEO optimization."),
});
export const TeacherValidation = Yup.object({
  teacher_name: getValidString("Teacher Name"),
  designation: getValidString("Designation"),
  expValue: Yup.number()
    .typeError("Must be a number")
    .positive("Must be positive")
    .required("Experience value is required"),
  expType: Yup.string().required("Experience type is required"),
});

export const locationSettingValidation = Yup.object({
  address: getValidString("address"),
  pincode: getValidString("pincode"),
  country: getValidForOnlyRequired("country"),
  state: getValidForOnlyRequired("state"),
  city: getValidForOnlyRequired("city"),
});

export const newsValidation = Yup.object({
  title: getValidString("Title"),
  content: getValidForOnlyRequired("Content"),
});
