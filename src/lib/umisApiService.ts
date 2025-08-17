// UMIS API Service for handling all student-related endpoints
import type { UmisTokensRecord } from "./xata.codegen";

// Interface definitions based on the API responses

export interface GeneralInformationPayload {
	id: number;
	isEMSIDAvailable: boolean;
	emsid: string;
	emisnaReaonsId: number | null;
	emisnaOthers: string;
	noEMISIdRemarks: string;
	salutationId: number;
	religionId: number;
	name: string;
	nameAsOnCertificate: string;
	dateOfBirth: string;
	genderId: number;
	bloodGroupId: number;
	nationalityId: number;
	communityId: number;
	casteId: number;
	casteValue: string;
	isCCUploaded: boolean;
	certificateNumber: string;
	firstGraduateCertificateNumber: string | null;
	aadhaarNumber: string;
	passportNumber: string | null;
	isFirstGraduate: string;
	isSpecialCategory: boolean;
	studentSplCategorys: any[];
	isDifferentlyAbled: boolean;
	udid: string;
	disabilityId: number | null;
	extentOfDisability: number;
	isPhotoUploaded: boolean;
	instituteId: number;
	salutationValue: string;
	bloodGroupValue: string;
	nationalityValue: string | null;
	religionValue: string;
	communityValue: string;
	disabilityValue: string;
	isEmisVerified: boolean;
	isekycDone: boolean;
	imagePath: string | null;
	studentSplCategorysForRemove: any[];
	pdfupload: string;
	studentAttachmentInfo: any[];
	region: number;
	nativeLanguage: string | null;
	identificationMark: string;
	identificationMark2: string;
	udiseCode: string;
	medium: string;
	fatherOccupationId: number;
	motherOccupationId: number;
	pincode: string;
	mobileNumber: string;
	permAddress: string;
	caAddress: string;
	fatherName: string;
	motherName: string;
	last_passed_class: string;
	guardianName: string;
	school_type: number;
	passed_year: string;
	tpEligible: boolean;
	tpSource: string;
	studentESevaiInfo: any;
	studentEMISDetails: any;
	studentEmisJson: any;
}

export interface ContactInformationPayload {
	id: number;
	studentId: number;
	countryId: number;
	countryIdOther: number;
	areaTypePermId: number;
	stateId: number;
	districtId: number;
	corporationId: number;
	zoneId: number;
	wardId: number;
	caCountryId: number;
	caStateId: number;
	caDistrictId: number;
	areaTypeCAId: number;
	caCorporationId: number;
	caZoneId: number;
	caWardId: number;
	caAddress: string;
	isCASameAsPA: boolean;
	permAddress: string;
	mobileNumber: string;
	emailId: string;
	talukId: number;
	villageId: number | null;
	blockId: number | null;
	villagePanchayatId: number | null;
	caTalukId: number;
	caVillageId: number | null;
	caBlockId: number | null;
	caVillagePanchayatId: number | null;
	emisId: string;
	isEMSIDAvailable: boolean;
	countryValue: string;
	stateValue: string;
	districtValue: string;
	corporationValue: string;
	talukValue: string;
	villageValue: string;
	zoneValue: string;
	wardValue: string;
	blockValue: string;
	panchayatValue: string;
	caCountryValue: string;
	caStateValue: string;
	caDistrictValue: string;
	caCorporationValue: string;
	caZoneValue: string;
	caTalukValue: string;
	caWardValue: string;
	pinCode: string;
	caPinCode: string;
}

export interface FamilyInformationPayload {
	id: number;
	studentId: number;
	isOrphan: boolean;
	isOrphanFile: string | null;
	fatherName: string;
	fatherOccupationId: number;
	motherName: string;
	motherOccupationId: number;
	guardianName: string;
	guardianOccupationId: number | null;
	parentMobileNo: string;
	parentEmailId: string;
	familyCardTypeId: number | null;
	familyCardNumber: string;
	familyAnnualIncome: number;
	isICUploaded: boolean;
	incomeCertificateNumber: string;
	incomeCertificate: string | null;
	studentESevaiInfo: any;
}

export interface BankInformationPayload {
	id: number;
	accountNumber: string;
	ifsc: string;
	bankName: string;
	name: string;
	cityName: string;
	studentId: number;
	accountTypeId: number;
	accountTypeName: string;
	accountHolderName: string | null;
	instituteId: number;
	bankBranchId: number;
	aadhaar_Number: string;
	bank_Name: string;
	last_Updated_Date: string;
	mobile_Number: string;
	processed_Date_TimeStamp: string | null;
	request_Number: string;
	request_received_date_time: string | null;
	requested_Date_TimeStamp: string;
	status: string;
	abbVerified: boolean;
}

export interface BankBranchInfo {
	id: number;
	name: string;
	address: string;
	ifsc: string;
	cityId: number;
	cityName: string;
	bankId: number;
	bankName: string;
}

export interface AcademicInformationPayload {
	id: number;
	studentId: number;
	academicYearId: number;
	courseId: number;
	modeOfStudyId: number;
	courseSpecializationId: number;
	dateOfAdmission: string;
	typeOfAdmissionId: number;
	academicStatusType: number;
	courseCategory: number;
	counsellingNo: string;
	registrationNo: string;
	isLateralEntry: boolean;
	isHosteler: boolean;
	hostelAdmissionDate: string | null;
	leavingFromHostelDate: string | null;
	isStudentUsingTransport: boolean;
	hostelType: number | null;
	dayScholarResidenceType: number;
	instituteId: number;
	courseType: number;
	streamInfoId: number;
	mediumOfInstructionType: number;
	cCDate: string | null;
	yearOfStudy: string;
}

export interface StudentApprovalPayload {
	studentApprovedType: number;
	id: number;
	rejectedRemarkId: number | null;
}

export interface ApiResponse<T = any> {
	message: string;
	value: T;
	isSuccess: boolean;
	isFailure: boolean;
	failures: string[];
	htmlFormattedFailures: string;
	exception: string | null;
	hasException: boolean;
	internalFailure: string | null;
}

export const umisApiService = {
	// Save or update general information
	saveOrUpdateGeneralInformation: async (
		payload: GeneralInformationPayload,
		token: string,
	): Promise<ApiResponse> => {
		try {
			const response = await fetch(
				"/umis-api/api/student/saveorupdategeneralinformation",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error saving general information:", error);
			throw error;
		}
	},

	// Save student contact details
	saveStudentContactDetails: async (
		payload: ContactInformationPayload,
		token: string,
	): Promise<ApiResponse> => {
		try {
			const response = await fetch(
				"/umis-api/api/studentcontact/newsavestudentcontactdetails",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error saving contact information:", error);
			throw error;
		}
	},

	// Get new student list for institute
	getNewStudentList: async (
		instituteId: number,
		token: string,
	): Promise<any[]> => {
		try {
			const response = await fetch(
				`/umis-api/api/student/NewstudentList/${instituteId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching student list:", error);
			throw error;
		}
	},

	// Get student information by ID
	getStudentInfo: async (
		studentId: number,
		token: string,
	): Promise<FamilyInformationPayload> => {
		try {
			const response = await fetch(
				`/umis-api/api/student/studentinfo/${studentId}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching student info:", error);
			throw error;
		}
	},

	// Get bank branch information by IFSC code
	getBankBranchByIFSC: async (
		ifscCode: string,
		token: string,
	): Promise<BankBranchInfo[]> => {
		try {
			const response = await fetch(
				`/umis-api/api/studentbankaccount/getbyifsc/${ifscCode}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error fetching bank branch info:", error);
			throw error;
		}
	},

	// Save student academic information
	saveStudentAcademicInfo: async (
		payload: AcademicInformationPayload,
		token: string,
	): Promise<ApiResponse> => {
		try {
			const response = await fetch(
				"/umis-api/api/studentacademicinfo/newsavestudentacademicinfo",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				},
			);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error saving academic information:", error);
			throw error;
		}
	},

	// Update student approval status
	updateStudentApproval: async (
		payload: StudentApprovalPayload,
		token: string,
	): Promise<ApiResponse> => {
		try {
			const response = await fetch("/umis-api/api/student/approval", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			return await response.json();
		} catch (error) {
			console.error("Error updating student approval:", error);
			throw error;
		}
	},
};

// Helper functions to transform form data to API payload format

export const transformGeneralInfoToPayload = (
	formData: any,
	studentId = 0,
	instituteId = 5871,
): GeneralInformationPayload => {
	return {
		id: studentId,
		isEMSIDAvailable: formData.emisAvailable === "yes",
		emsid: formData.emisId || "",
		emisnaReaonsId: formData.emisUnavailableReason || null,
		emisnaOthers: "",
		noEMISIdRemarks: "",
		salutationId: getSalutationId(formData.salutation),
		religionId: getReligionId(formData.religion),
		name: formData.studentNameCertificate || "",
		nameAsOnCertificate: formData.studentNameCertificate || "",
		dateOfBirth: formData.dateOfBirth || "",
		genderId: getGenderId(formData.gender),
		bloodGroupId: getBloodGroupId(formData.bloodGroup),
		nationalityId: getNationalityId(formData.nationality),
		communityId: getCommunityId(formData.community),
		casteId: getCasteId(formData.caste),
		casteValue: formData.caste || "",
		isCCUploaded: false,
		certificateNumber: formData.communityCertificateNumber || "",
		firstGraduateCertificateNumber: null,
		aadhaarNumber: formData.aadhaarNumber || "",
		passportNumber: null,
		isFirstGraduate: formData.firstGraduate === "yes" ? "Yes" : "No",
		isSpecialCategory: formData.specialQuota === "yes",
		studentSplCategorys: [],
		isDifferentlyAbled: formData.differentlyAbled === "yes",
		udid: "",
		disabilityId: null,
		extentOfDisability: 0,
		isPhotoUploaded: false,
		instituteId,
		salutationValue: formData.salutation || "",
		bloodGroupValue: formData.bloodGroup || "",
		nationalityValue: formData.nationality || "",
		religionValue: formData.religion || "",
		communityValue: formData.community || "",
		disabilityValue: "",
		isEmisVerified: formData.emisAvailable === "yes",
		isekycDone: !!formData.aadhaarNumber,
		imagePath: null,
		studentSplCategorysForRemove: [],
		pdfupload: "",
		studentAttachmentInfo: [],
		region: 1,
		nativeLanguage: null,
		identificationMark: "",
		identificationMark2: "",
		udiseCode: "",
		medium: "English",
		fatherOccupationId: 10,
		motherOccupationId: 103,
		pincode: formData.permanentAddress?.postalAddress?.split(" ").pop() || "",
		mobileNumber: formData.mobileNumber || "",
		permAddress: formData.permanentAddress?.postalAddress || "",
		caAddress: formData.communicationAddress?.postalAddress || "",
		fatherName: formData.fatherName || "",
		motherName: formData.motherName || "",
		last_passed_class: "12",
		guardianName: formData.guardianName || "None",
		school_type: 0,
		passed_year: "2021-2022",
		tpEligible: false,
		tpSource: "false",
		studentESevaiInfo: {},
		studentEMISDetails: {},
		studentEmisJson: {},
	};
};

export const transformContactInfoToPayload = (
	formData: any,
	studentId: number,
): ContactInformationPayload => {
	return {
		id: 0,
		studentId,
		countryId: 83, // India
		countryIdOther: 83,
		areaTypePermId: 68,
		stateId: getStateId(formData.permanentAddress?.state),
		districtId: getDistrictId(formData.permanentAddress?.district),
		corporationId: getCorporationId(formData.permanentAddress?.corporation),
		zoneId: getZoneId(formData.permanentAddress?.zone),
		wardId: getWardId(formData.permanentAddress?.ward),
		caCountryId: 83,
		caStateId: getStateId(formData.communicationAddress?.state),
		caDistrictId: getDistrictId(formData.communicationAddress?.district),
		areaTypeCAId: 68,
		caCorporationId: getCorporationId(formData.communicationAddress?.corporation),
		caZoneId: getZoneId(formData.communicationAddress?.zone),
		caWardId: getWardId(formData.communicationAddress?.ward),
		caAddress: formData.communicationAddress?.postalAddress || "",
		isCASameAsPA: formData.communicationAddress?.sameAsPermanent || false,
		permAddress: formData.permanentAddress?.postalAddress || "",
		mobileNumber: formData.mobileNumber || "",
		emailId: formData.emailId || "",
		talukId: getTalukId(formData.permanentAddress?.taluk),
		villageId: null,
		blockId: null,
		villagePanchayatId: null,
		caTalukId: getTalukId(formData.communicationAddress?.taluk),
		caVillageId: null,
		caBlockId: null,
		caVillagePanchayatId: null,
		emisId: "",
		isEMSIDAvailable: false,
		countryValue: "India",
		stateValue: formData.permanentAddress?.state || "",
		districtValue: formData.permanentAddress?.district || "",
		corporationValue: formData.permanentAddress?.corporation || "",
		talukValue: formData.permanentAddress?.taluk || "",
		villageValue: "",
		zoneValue: formData.permanentAddress?.zone || "",
		wardValue: formData.permanentAddress?.ward || "",
		blockValue: "",
		panchayatValue: "",
		caCountryValue: "India",
		caStateValue: formData.communicationAddress?.state || "",
		caDistrictValue: formData.communicationAddress?.district || "",
		caCorporationValue: formData.communicationAddress?.corporation || "",
		caZoneValue: formData.communicationAddress?.zone || "",
		caTalukValue: formData.communicationAddress?.taluk || "",
		caWardValue: formData.communicationAddress?.ward || "",
		pinCode: formData.permanentAddress?.postalAddress?.split(" ").pop() || "",
		caPinCode:
			formData.communicationAddress?.postalAddress?.split(" ").pop() || "",
	};
};

export const transformAcademicInfoToPayload = (
	formData: any,
	studentId: number,
	instituteId = 5871,
): AcademicInformationPayload => {
	return {
		id: 0,
		studentId,
		academicYearId: getAcademicYearId(formData.academicYear),
		courseId: getCourseId(formData.course),
		modeOfStudyId: getModeOfStudyId(formData.modeOfStudy),
		courseSpecializationId: getCourseSpecializationId(
			formData.branchSpecialization,
		),
		dateOfAdmission: formData.dateOfAdmission || "",
		typeOfAdmissionId: getTypeOfAdmissionId(formData.typeOfAdmission),
		academicStatusType: 1,
		courseCategory: 1,
		counsellingNo: formData.counselingNumber || "",
		registrationNo: formData.registrationNumber || "",
		isLateralEntry: formData.isLateralEntry === "yes",
		isHosteler: formData.isHosteler === "yes",
		hostelAdmissionDate: formData.hostelAdmissionDate || null,
		leavingFromHostelDate: formData.hostelLeavingDate || null,
		isStudentUsingTransport: false,
		hostelType: null,
		dayScholarResidenceType: 4,
		instituteId,
		courseType: getCourseTypeId(formData.courseType),
		streamInfoId: getStreamInfoId(formData.streamType),
		mediumOfInstructionType: getMediumOfInstructionId(
			formData.mediumOfInstruction,
		),
		cCDate: null,
		yearOfStudy: formData.yearOfStudy || "",
	};
};

// Helper functions for ID mappings (these would need to be populated with actual API data)
const getSalutationId = (salutation: string): number => {
	const mapping: Record<string, number> = {
		Selvan: 56,
		Selvi: 57,
		Thiru: 58,
		Thirumathi: 59,
	};
	return mapping[salutation] || 56;
};

const getReligionId = (religion: string): number => {
	const mapping: Record<string, number> = {
		Hindu: 1,
		Christian: 2,
		Muslim: 3,
		Buddhism: 4,
		Jainism: 5,
		Sikh: 6,
	};
	return mapping[religion] || 1;
};

const getGenderId = (gender: string): number => {
	const mapping: Record<string, number> = {
		male: 1,
		female: 2,
		third_gender: 3,
	};
	return mapping[gender] || 1;
};

const getBloodGroupId = (bloodGroup: string): number => {
	const mapping: Record<string, number> = {
		"A+": 70,
		"A-": 71,
		"B+": 77,
		"B-": 73,
		"AB+": 74,
		"AB-": 75,
		"O+": 76,
		"O-": 78,
	};
	return mapping[bloodGroup] || 77;
};

const getNationalityId = (nationality: string): number => {
	return nationality === "Indian" ? 1 : 2;
};

const getCommunityId = (community: string): number => {
	const mapping: Record<string, number> = {
		BC: 11,
		"BC Muslim": 10,
		"DNC/DNT": 13,
		MBC: 3,
		"NOT APPLICABLE": 1,
		"Not Stated": 14,
		OC: 6,
		SC: 12,
		"SC Arunthathiyar": 7,
		ST: 4,
	};
	return mapping[community] || 11;
};

const getCasteId = (caste: string): number => {
	// This would need to be dynamically fetched based on the caste name
	// For now, returning a default value
	return 4034;
};

const getStateId = (state: string): number => {
	// Tamil Nadu default
	return state === "TAMIL NADU" ? 1 : 1;
};

const getDistrictId = (district: string): number => {
	// Chennai default
	return district === "CHENNAI" ? 2 : 2;
};

const getCorporationId = (corporation: string): number => {
	// Chennai default
	return corporation === "CHENNAI" ? 1005 : 1005;
};

const getZoneId = (zone: string): number => {
	// Default zone
	return 9;
};

const getWardId = (ward: string): number => {
	// Default ward
	return 207;
};

const getTalukId = (taluk: string): number => {
	// Mylapore default
	return taluk === "MYLAPORE" ? 22 : 22;
};

const getAcademicYearId = (academicYear: string): number => {
	// Default academic year
	return 223;
};

const getCourseId = (course: string): number => {
	// Default course
	return 24;
};

const getModeOfStudyId = (modeOfStudy: string): number => {
	// Default mode of study
	return 84;
};

const getCourseSpecializationId = (specialization: string): number => {
	// Default specialization
	return 13530;
};

const getTypeOfAdmissionId = (typeOfAdmission: string): number => {
	// Default type of admission
	return 88;
};

const getCourseTypeId = (courseType: string): number => {
	// Default course type
	return 3;
};

const getStreamInfoId = (streamType: string): number => {
	// Default stream
	return 19;
};

const getMediumOfInstructionId = (medium: string): number => {
	// English default
	return medium === "English" ? 2 : 2;
};