import React, { useEffect, useState } from 'react';
import { API } from '../../../services/API';
import toast from 'react-hot-toast';
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from 'react-router-dom';
import ProfileSkeleton from './ProfileSkeleton.jsx';
import Button from '../../../components/ui/Button/Button.jsx';
import ProfileImageCropper from '../../../components/common/ImageCropper/ProfileImageCropper.jsx';
import Avatar from '../../../components/common/Avatar/Avatar.jsx';
import FormInput from '../../../components/ui/Form/FormInput.jsx';
import { capitalizeWords } from '../../../utils/format.js';
import FormPhoneInput from '../../../components/ui/Form/FormPhoneInput.jsx';
import FormTextarea from '../../../components/ui/Form/FormTextarea.jsx';
import Select from "react-select";

const MAX_BIO = 2000;

function Profile() {
    const navigate = useNavigate();
    const [authUser, setAuthUser] = useState(null);
    const [previewProfile, setPreviewProfile] = useState(null);
    const [cropImageSrc, setCropImageSrc] = useState(null);
    const [niche, setNiche] = useState([]);

    const getAuthUserData = async () => {
        try {
            const { data } = await API.get("/profile");
            setAuthUser(data?.data);
        } catch (error) {
            toast.error(error.message || "Failed to fetch profile");
        }
    };

    const fetchNiche = async () => {
        try {
            const { data } = await API.get("/niche/options");
            setNiche(data?.data);
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong.");
        }
    };

    useEffect(() => {
        getAuthUserData();
        fetchNiche();
    }, []);

    const validationSchema = Yup.object({
        name: Yup.string()
            .required("Name is required.")
            .matches(/^(?!.*\s{2})[A-Za-z\s]+$/, 'Name can contain only alphabets and single spaces.')
            .min(2, "Name must contain atleast 2 characters"),
        email: Yup.string()
            .email("Invalid email")
            .required("Email is required."),
        contact: Yup.string()
            .required("Contact number is required.")
            .transform(value => value.replace(/\s/g, ""))
            .matches(/^(\+91|0)?[6-9][0-9]{9}$/, "Please enter a valid Indian contact number"),
        bio: Yup.string().max(MAX_BIO, `Max ${MAX_BIO} characters`),
        nicheId: Yup.string().required("Niche is required."),
    });

    const initialValues = {
        profile_image: authUser?.profile_image || "",
        name: authUser?.name || "",
        email: authUser?.email || "",
        contact: authUser?.contact || "",
        nicheId: authUser?.nicheId ? String(authUser.nicheId) : "",
        bio: authUser?.bio || "",
    }

    const handleSubmit = async (values) => {
        const toastId = toast.loading("Saving...");
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("email", values.email);
        formData.append("contact", values.contact);
        formData.append("nicheId", values.nicheId);
        formData.append("bio", values.bio);
        formData.append("profile_image", values.profile_image);

        try {
            const response = await API.put(`/update-profile`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success(response.data.message || "Updated successfully!", { id: toastId });
            navigate(0);
        } catch (error) {
            const errorMessage = error.response?.data?.error || "Something went wrong. Please try again.";
            toast.error(errorMessage);
            toast.dismiss(toastId);
        }
    };

    const formik = useFormik({
        initialValues: initialValues,
        validationSchema: validationSchema,
        onSubmit: handleSubmit,
        enableReinitialize: true
    });

    const handleFileChange = (e) => {
        const file = e.currentTarget.files?.[0];
        if (!file) return;

        if (!/^image\/(jpeg|png|jpg)$/i.test(file.type)) {
            toast.error("Only JPG/PNG images allowed");
            return;
        }

        const url = URL.createObjectURL(file);
        setCropImageSrc(url); // open cropper modal
    };

    const handleCropSave = (blob) => {
        try {
            const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
            formik.setFieldValue("profile_image", file); // ✅ only here
            setPreviewProfile(URL.createObjectURL(blob));
            setCropImageSrc(null);
        } catch (err) {
            toast.error("Image processing failed");
        }
    };

    if (!authUser) {
        return <ProfileSkeleton />;
    }

    return (
        <>
            {cropImageSrc && (
                <ProfileImageCropper
                    image={cropImageSrc}
                    onClose={() => setCropImageSrc(null)}
                    onCropComplete={handleCropSave}
                />
            )}
            <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>
                <div className="space-y-6">

                    <form onSubmit={formik.handleSubmit} className="space-y-6" encType="multipart/form-data">
                        {/* Profile Image Preview */}
                        <div className="flex flex-col items-center space-y-3">
                            {previewProfile ? (
                                <img
                                    src={previewProfile}
                                    alt="Profile Preview"
                                    className="rounded-full w-20 h-20 object-cover border"
                                    loading="lazy"
                                />
                            ) : (
                                <Avatar
                                    name={authUser?.name}
                                    src={authUser?.profile_image}
                                    size={20}
                                />
                            )}

                            {/* Upload Button */}
                            <div>
                                <input
                                    type="file"
                                    id="profile_image"
                                    name="profile_image"
                                    accept="image/jpeg, image/png"
                                    hidden
                                    onChange={handleFileChange}
                                    onBlur={formik.handleBlur}
                                />
                                <label
                                    htmlFor="profile_image"
                                    className="mt-2 inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md cursor-pointer hover:bg-blue-700"
                                >
                                    Choose Profile
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <FormInput
                                label="Name"
                                name="name"
                                placeholder="Enter name"
                                formik={formik}
                                transform={capitalizeWords}
                                trimOnBlur
                            />

                            {/* Email */}
                            <FormInput
                                label="Email"
                                name="email"
                                type="email"
                                placeholder="Enter email"
                                formik={formik}
                                disabled={true}
                            />

                            {/* Contact */}
                            <FormPhoneInput
                                label="Contact"
                                name="contact"
                                formik={formik}
                                disabled={!!authUser?.contact}
                            />

                            <div className="flex flex-col gap-1">
                                <label className="text-sm font-medium text-gray-700">Niche</label>
                                <Select
                                    name="nicheId"
                                    options={niche?.map(n => ({ value: n.id || n._id, label: n.name }))}
                                    value={niche
                                        ?.map(n => ({ value: n.id || n._id, label: n.name }))
                                        .find(option => String(option.value) === String(formik.values.nicheId)) || null
                                    }
                                    onChange={(option) => formik.setFieldValue("nicheId", option ? option.value : "")}
                                    onBlur={() => formik.setFieldTouched("nicheId", true)}
                                    placeholder="Select a niche"
                                    classNamePrefix="react-select"
                                    className={formik.touched.nicheId && formik.errors.nicheId ? "border border-red-500 rounded" : ""}
                                />
                                {formik.touched.nicheId && formik.errors.nicheId && (
                                    <span className="text-red-500 text-xs">{formik.errors.nicheId}</span>
                                )}
                            </div>
                        </div>

                        {/* Bio */}
                        <FormTextarea
                            label="Bio"
                            name="bio"
                            rows={6}
                            placeholder="Bio!"
                            maxLength={MAX_BIO}
                            formik={formik}
                        />

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                loading={formik.isSubmitting}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Profile