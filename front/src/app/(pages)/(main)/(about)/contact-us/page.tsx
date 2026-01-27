"use client";

import React, { useState } from "react";
import { BiCopy, BiMailSend, BiMapPin, BiPhone } from "react-icons/bi";
import { BsArrowRight, BsArrowUpRight, BsWhatsapp } from "react-icons/bs";
import { socailLinks } from "@/common/SocailMedaiData";
import {
	getErrorResponse,
	getSuccessResponse,
	handleCopy,
} from "@/context/Callbacks";
import { emailValidation } from "@/context/ValidationSchema";
import { useFormik } from "formik";
import API from "@/context/API";

const CopyButton = ({ text, label }: { text: string; label: string }) => (
	<button
		onClick={(e) => {
			e.stopPropagation();
			handleCopy(text, label);
		}}
		className="p-2.5 rounded-full bg-(--main-light) text-(--main-emphasis) transition-colors z-20 relative group-hover:scale-110 active:scale-95 duration-200"
		title={`Copy ${label}`}
	>
		<BiCopy size={16} />
	</button>
);

const ContactUs = () => {
	const YP_EMAIL = `${process.env.NEXT_PUBLIC_YP_EMAIL}`;
	const YP_PHONE = `${process.env.NEXT_PUBLIC_YP_PHONE}`;

	const [subscribed, setSubscribed] = useState(false);
	const [loading, setLoading] = useState(false);
	const formik = useFormik({
		initialValues: {
			email: "",
			source: "contact-us",
		},
		enableReinitialize: true,
		validationSchema: emailValidation,
		onSubmit: async (values, { resetForm }) => {
			try {
				setLoading(true);

				const res = await API.post("/add/news-letter", values);

				if (res?.data) {
					setSubscribed(true);
					resetForm();
					getSuccessResponse(res);
				}
			} catch (error) {
				getErrorResponse(error);
			} finally {
				setLoading(false);
			}
		},
	});

	return (
		<div className="min-h-screen bg-(--primary-bg) text-(--text-color) sm:px-8 px-4">
			<div className="py-12 relative z-10 ">
				<div className="pb-12">
					<div className="relative ">
						<h1 className="text-4xl sm:text-5xl md:text-6xl max-w-3xl">
							Contact <span className="text-(--main)">Campusaim</span>
						</h1>
						<div className="mt-6 mb-10 w-84 h-[2px] bg-gradient-to-r from-(--main) to-transparent" />

						<div className="space-y-6 max-w-3xl">
							<p className="leading-relaxed">
								Located in the heart of Tapovan. Whether you are a beginner or a
								master, our doors are open to your journey Lorem ipsum dolor
								sit, amet consectetur adipisicing elit. Quidem laborum
								laudantium ullam, itaque ratione autem repellendus illum,
								exercitationem eaque eligendi earum excepturi amet omnis
								obcaecati aspernatur nemo nostrum sint pariatur..
							</p>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-5">
					<div className="md:col-span-2 md:row-span-2 bg-(--text-color-emphasis) flex flex-col justify-between min-h-[350px] md:min-h-full group p-6 rounded-custom">
						<div className="flex justify-between items-start">
							<div className="p-4 bg-(--primary-bg)/10 backdrop-blur-xl rounded-custom text-(--success) border border-(--success) group-hover:bg-(--primary-bg)/5 transition-colors duration-300">
								<BsWhatsapp size={28} />
							</div>
						</div>
						<div className="mt-8 md:mt-0">
							<h3 className="text-3xl font-serif mb-3 text-(--primary-bg)">
								Chat on WhatsApp
							</h3>
							<p className="text-(--secondary-bg) text-base mb-8 max-w-sm leading-relaxed font-light">
								Fastest response for class bookings, retreat details, and
								general inquiries.
							</p>
							<a
								href={`https://wa.me/${YP_PHONE}`}
								target="_blank"
								className="inline-flex items-center gap-3 bg-(--success) text-(--success-subtle) px-6 py-3 rounded-full font-semibold hover:opacity-80 transition-colors"
							>
								Start Conversation <BsArrowUpRight size={18} />
							</a>
						</div>
					</div>

					<div className="md:col-span-2 md:row-span-2 flex flex-col gap-4 md:gap-6">
						<div className="relative flex-1 rounded-custom bg-(--secondary-bg) p-6 transition-all duration-300 group hover:-translate-y-1 shadow-custom">
							<div className="relative space-y-6">
								<div className="flex justify-between items-start">
									<div className="p-3 rounded-custom bg-(--primary-bg) transition-all duration-300 group-hover:bg-(--main-light) group-hover:text-(--main-emphasis) group-hover:-translate-y-1">
										<BiMailSend size={22} />
									</div>

									<CopyButton text={YP_EMAIL} label="Email" />
								</div>

								<a href={`mailto:${YP_EMAIL}`} className="block font-medium">
									Email
									<span className="block text-base font-semibold text-(--secondary-text) group-hover:text-(--main) transition-colors">
										{YP_EMAIL}
									</span>
								</a>
							</div>
						</div>

						<div className="relative flex-1 bg-(--secondary-bg) rounded-custom p-6  shadow-custom transition-all duration-300 group hover:-translate-y-1">
							<div className="relative space-y-6">
								<div className="flex justify-between items-start">
									<div className="p-3 rounded-custom bg-(--primary-bg) transition-all duration-300 group-hover:bg-(--main-light) group-hover:text-(--main-emphasis) group-hover:-translate-y-1">
										<BiPhone size={22} />
									</div>

									<CopyButton text={YP_PHONE} label="Phone" />
								</div>

								<a href={`tel:${YP_PHONE}`} className="block font-medium">
									Call
									<span className="block text-base font-semibold text-(--secondary-text) group-hover:text-(--main) transition-colors">
										{YP_PHONE}
									</span>
								</a>
							</div>
						</div>
					</div>

					<div className="col-span-1 md:col-span-2 bg-(--secondary-bg) p-6 rounded-custom shadow-custom">
						<h3 className="font-bold mb-2">Join our circle</h3>
						<p>Monthly mindfulness tips, retreat news, and early access.</p>

						<form onSubmit={formik.handleSubmit} className="relative mt-6">
							<input
								type="email"
								name="email"
								value={formik.values.email}
								onChange={formik.handleChange}
								onBlur={formik.handleBlur}
								placeholder="Email address"
								className="w-full bg-(--primary-bg) rounded-custom px-5 py-2 border border-(--primary-border) outline-none pr-12"
							/>

							<button
								type="submit"
								disabled={loading || subscribed}
								className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-(--text-color) text-(--primary-bg) rounded-custom hover:scale-105 active:scale-95 transition-all disabled:opacity-60"
							>
								<BsArrowRight size={16} />
							</button>
						</form>

						{formik.touched.email && formik.errors.email && (
							<p className="text-red-500 text-sm mt-1">{formik.errors.email}</p>
						)}

						{subscribed && (
							<p className="text-green-500 text-sm mt-2">
								You’re successfully subscribed 🎉
							</p>
						)}
					</div>

					<div className="col-span-1 md:col-span-2 bg-(--secondary-bg) flex items-center justify-between p-6 rounded-custom shadow-custom">
						<div className="flex flex-col">
							<h3 className="heading font-semibold">Follow along</h3>
							<p>@campusaim</p>
						</div>
						<div className="flex gap-2">
							{socailLinks.map((item, i) => {
								const ICON = item?.icon;
								return (
									<a
										key={i}
										href={item?.href}
										title={item?.name}
										target="_blank"
										className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-(--primary-bg) rounded-full hover:bg-(--secondary-bg) hover:text-(--text-color-emphasis) transition-all duration-300 hover:-translate-y-1 border border-(- -border)"
									>
										<ICON size={20} />
									</a>
								);
							})}
						</div>
					</div>

					<div className="col-span-1 md:col-span-4 min-h-[350px] relative group shadow-custom rounded-custom">
						<iframe
							src="https://maps.google.com/maps?width=600&height=400&hl=en&q=dehradun&t=&z=14&ie=UTF8&iwloc=B&output=embed"
							width="100%"
							height="100%"
							style={{
								border: 0,
								filter: "grayscale(100%) opacity(0.85) contrast(1.1)",
							}}
							loading="lazy"
							className="absolute inset-0 w-full h-full group-hover:filter-none group-hover:opacity-100 transition-all duration-700 rounded-custom"
						></iframe>

						{/* Map Badge */}
						<div className="absolute top-3 right-3 bg-(--primary-bg) backdrop-blur-md p-5 rounded-custom shadow-custom z-10">
							<div className="flex items-start gap-3">
								<div className="mt-1 bg-(--main-light) p-1.5 rounded-full">
									<BiMapPin className="text-(--main)" size={16} />
								</div>
								<div>
									<p className="font-bold pb-1">Campusaim</p>
									<p>
										Dehradun,
										<br />
										Uttarakhand, India,
										<br /> 248001
									</p>
									<div className="mt-3 flex items-center gap-1 text-xs font-bold text-(--main) uppercase tracking-wide">
										<span>Get Directions</span> <BsArrowUpRight size={10} />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactUs;
