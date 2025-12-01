import * as Yup from "yup";
import { parsePhoneNumberFromString } from "libphonenumber-js";

const username = Yup.string()
  .min(3, "Username must be at least 3 characters")
  .matches(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores without spaces"
  )
  .required("Username is required");

const name = Yup.string()
  .min(3, "Name must be at least 3 characters")
  .matches(/^\S.*\S$/, "Name cannot start or end with a space")
  .required("Name is required");

const email = Yup.string().email("Invalid email").required("Email is required");

const mobile_no = Yup.string()
  .test("valid-phone", "Invalid phone number", (value) => {
    if (!value) return false;
    const phoneNumber = parsePhoneNumberFromString(`+${value}`);
    return phoneNumber && phoneNumber.isValid();
  })
  .required("Phone number is required");

const password = Yup.string()
  .min(6, "Password must be at least 6 characters")
  .matches(/^\S*$/, "Password cannot contain spaces")
  .required("Password is required");

const confirmPassword = (field = "password") =>
  Yup.string()
    .oneOf([Yup.ref(field)], "Passwords must match")
    .required("Confirm Password is required");

const address = Yup.string()
  .matches(/^\S.*\S$/, "Address cannot start or end with a space")
  .required("Address is required");
const pincode = Yup.string()
  .matches(/^\S.*\S$/, "Pincode cannot start or end with a space")
  .required("Pincode is required");
const country = Yup.string().required("Country is required");
const state = Yup.string().required("State is required");
const city = Yup.string().required("City is required");

export const LoginValidation = Yup.object({ email, password });

export const RegisterValidation = Yup.object({
  username,
  name,
  email,
  mobile_no,
  password,
  confirm_password: confirmPassword(),
});

export const EmailValidation = Yup.object({ email });

export const EnquiryValidation = Yup.object({
  name,
  email,
  contact: mobile_no,
});

export const ReviewValidation = Yup.object({
  name,
  email,
  phone: mobile_no,
  review: Yup.string()
    .min(10, "Review too short")
    .required("Review is required"),
});

export const EditProfileValidation = Yup.object({
  name,
  email,
  mobile_no: Yup.string().required("Mobile number is required"),
  alt_mobile_no: Yup.string(),
  address,
  pincode,
  city,
  state,
  country,
});

export const ResetPasswordValidation = Yup.object({
  new_password: password,
  confirm_password: confirmPassword("new_password"),
});

export const ProfileAboutValidation = Yup.object({
  heading: Yup.string()
    .max(200, "Heading must be at most 200 characters")
    .required("Heading is Required"),
  about: Yup.string()
    .max(600, "About must be at most 600 characters")
    .required("About is Required"),
});

export const ProfileExperienceValidation = Yup.object().shape({
  position: Yup.string().required("Position is required"),
  property_id: Yup.string().nullable(),
  property_name: Yup.string()
    .nullable()
    .when("property_id", (property_id, schema) =>
      !property_id ? schema.required("Company is required") : schema.nullable()
    ),
  location: Yup.string().required("Location is required"),
  start_date: Yup.string()
    .required("Start date is required")
    .matches(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
  end_date: Yup.string()
    .nullable()
    .matches(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format")
    .test(
      "required-if-not-currently",
      "End date is required if not currently working",
      function (value) {
        const { currentlyWorking } = this.parent;
        return currentlyWorking || !!value;
      }
    )
    .test(
      "end-after-start",
      "End date must be after start date",
      function (value) {
        const { start_date, currentlyWorking } = this.parent;
        if (currentlyWorking || !value || !start_date) return true;
        return new Date(value + "-01") > new Date(start_date + "-01");
      }
    ),
  currentlyWorking: Yup.boolean(),
});

export const ProfileEducationValidation = Yup.object().shape({
  degreeSelect: Yup.object()
    .shape({
      value: Yup.string(),
      label: Yup.string().required("Degree is required"),
    })
    .nullable()
    .required("Degree is required"),
  instituteSelect: Yup.object()
    .shape({
      value: Yup.string(),
      label: Yup.string().required("Institute is required"),
    })
    .nullable()
    .required("Institute is required"),
  start_date: Yup.string()
    .required("Start date is required")
    .matches(/^\d{4}-\d{2}$/, "Start date must be in YYYY-MM format"),
  end_date: Yup.string()
    .nullable()
    .matches(/^\d{4}-\d{2}$/, "End date must be in YYYY-MM format")
    .test(
      "end-date-check",
      "End date is required if not currently studying",
      function (value) {
        const { currentlyStuding } = this.parent;
        if (currentlyStuding) return true;
        return !!value;
      }
    )
    .test(
      "end-after-start",
      "End date must be after start date",
      function (value) {
        const { start_date, currentlyStuding } = this.parent;
        if (currentlyStuding || !value || !start_date) return true;
        const start = new Date(start_date + "-01");
        const end = new Date(value + "-01");
        return end > start;
      }
    ),
  currentlyStuding: Yup.boolean(),
});

export const BlogEnquiryValidation = Yup.object({
  name,
  email,
  mobile_no,
  message: Yup.string().required("Message is Required"),
});
