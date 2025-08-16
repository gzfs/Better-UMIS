import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ProgressStepper, type Step } from "./ProgressStepper";
import { useTokenStore } from "../store/tokenStore";

// Import tab components (we'll create these)
import { GeneralInformationTab } from "./tabs/GeneralInformationTab";
import { ContactInformationTab } from "./tabs/ContactInformationTab"; 
import { FamilyInformationTab } from "./tabs/FamilyInformationTab";
import { BankInformationTab } from "./tabs/BankInformationTab";
import { AcademicInformationTab } from "./tabs/AcademicInformationTab";
import { CompletionTab } from "./tabs/CompletionTab";

export interface StudentFormData {
	// General Information
	emisAvailable: "yes" | "no" | "";
	emisUnavailableReason: string;
	salutation: string;
	studentNameCertificate: string;
	studentNameAadhaar: string;
	nationality: string;
	stateName: string;
	gender: "male" | "female" | "third_gender" | "";
	bloodGroup: string;
	dateOfBirth: string;
	religion: string;
	community: string;
	caste: string;
	communityCertificateNumber: string;
	aadhaarNumber: string;
	firstGraduate: "yes" | "no" | "not_applicable" | "";
	specialQuota: "yes" | "no" | "";
	differentlyAbled: "yes" | "no" | "";
	
	// Contact Information
	mobileNumber: string;
	emailId: string;
	permanentAddress: {
		country: string;
		state: string;
		locationType: string;
		district: string;
		taluk: string;
		village: string;
		corporation: string;
		zone: string;
		ward: string;
		block: string;
		villagePanchayat: string;
		postalAddress: string;
	};
	communicationAddress: {
		sameAsPermanent: boolean;
		country: string;
		state: string;
		locationType: string;
		district: string;
		taluk: string;
		village: string;
		corporation: string;
		zone: string;
		ward: string;
		block: string;
		villagePanchayat: string;
		postalAddress: string;
	};
	
	// Family Information
	fatherName: string;
	fatherOccupation: string;
	motherName: string;
	motherOccupation: string;
	guardianName: string;
	isOrphan: "yes" | "no" | "";
	familyAnnualIncome: string;
	parentMobileNumber: string;
	incomeCertificateNumber: string;
	
	// Bank Information
	accountNumber: string;
	ifscCode: string;
	bankName: string;
	bankBranch: string;
	city: string;
	
	// Academic Information
	academicYear: string;
	streamType: string;
	courseType: string;
	course: string;
	branchSpecialization: string;
	mediumOfInstruction: string;
	modeOfStudy: string;
	dateOfAdmission: string;
	typeOfAdmission: string;
	counselingNumber: string;
	registrationNumber: string;
	isLateralEntry: "yes" | "no" | "";
	isHosteler: "yes" | "no" | "";
	hostelAdmissionDate: string;
	hostelLeavingDate: string;
	hostelType: string;
	yearOfStudy: string;
}

const INITIAL_FORM_DATA: StudentFormData = {
	// General Information
	emisAvailable: "",
	emisUnavailableReason: "",
	salutation: "",
	studentNameCertificate: "",
	studentNameAadhaar: "",
	nationality: "Indian",
	stateName: "",
	gender: "",
	bloodGroup: "",
	dateOfBirth: "",
	religion: "",
	community: "",
	caste: "",
	communityCertificateNumber: "",
	aadhaarNumber: "",
	firstGraduate: "",
	specialQuota: "",
	differentlyAbled: "",
	
	// Contact Information
	mobileNumber: "",
	emailId: "",
	permanentAddress: {
		country: "India",
		state: "",
		locationType: "",
		district: "",
		taluk: "",
		village: "",
		corporation: "",
		zone: "",
		ward: "",
		block: "",
		villagePanchayat: "",
		postalAddress: "",
	},
	communicationAddress: {
		sameAsPermanent: false,
		country: "India",
		state: "",
		locationType: "",
		district: "",
		taluk: "",
		village: "",
		corporation: "",
		zone: "",
		ward: "",
		block: "",
		villagePanchayat: "",
		postalAddress: "",
	},
	
	// Family Information
	fatherName: "",
	fatherOccupation: "",
	motherName: "",
	motherOccupation: "",
	guardianName: "",
	isOrphan: "",
	familyAnnualIncome: "",
	parentMobileNumber: "",
	incomeCertificateNumber: "",
	
	// Bank Information
	accountNumber: "",
	ifscCode: "",
	bankName: "",
	bankBranch: "",
	city: "",
	
	// Academic Information
	academicYear: "",
	streamType: "",
	courseType: "",
	course: "",
	branchSpecialization: "",
	mediumOfInstruction: "",
	modeOfStudy: "",
	dateOfAdmission: "",
	typeOfAdmission: "",
	counselingNumber: "",
	registrationNumber: "",
	isLateralEntry: "",
	isHosteler: "",
	hostelAdmissionDate: "",
	hostelLeavingDate: "",
	hostelType: "",
	yearOfStudy: "",
};

export const StudentRegistrationWizard = () => {
	const [currentStep, setCurrentStep] = useState(0);
	const [formData, setFormData] = useState<StudentFormData>(INITIAL_FORM_DATA);
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
	const { currentToken } = useTokenStore();

	const steps: Step[] = [
		{
			id: "general",
			title: "General Information",
			status: currentStep > 0 ? "completed" : currentStep === 0 ? "current" : "pending",
		},
		{
			id: "contact", 
			title: "Contact Information",
			status: currentStep > 1 ? "completed" : currentStep === 1 ? "current" : "pending",
		},
		{
			id: "family",
			title: "Family Information", 
			status: currentStep > 2 ? "completed" : currentStep === 2 ? "current" : "pending",
		},
		{
			id: "bank",
			title: "Bank Information",
			status: currentStep > 3 ? "completed" : currentStep === 3 ? "current" : "pending",
		},
		{
			id: "academic",
			title: "Current Academic Information",
			status: currentStep > 4 ? "completed" : currentStep === 4 ? "current" : "pending",
		},
		{
			id: "completed",
			title: "Completed",
			status: currentStep > 5 ? "completed" : currentStep === 5 ? "current" : "pending",
		},
	];

	const updateFormData = (updates: Partial<StudentFormData>) => {
		setFormData(prev => ({ ...prev, ...updates }));
	};

	const validateCurrentStep = (): boolean => {
		const errors: Record<string, string> = {};
		
		switch (currentStep) {
			case 0: // General Information
				if (!formData.emisAvailable) errors.emisAvailable = "EMIS ID availability is required";
				if (formData.emisAvailable === "no" && !formData.emisUnavailableReason) {
					errors.emisUnavailableReason = "Reason for EMIS ID unavailability is required";
				}
				if (!formData.salutation) errors.salutation = "Salutation is required";
				if (!formData.studentNameCertificate) errors.studentNameCertificate = "Student name (as on certificate) is required";
				if (!formData.studentNameAadhaar) errors.studentNameAadhaar = "Student name (as on Aadhaar) is required";
				if (!formData.nationality) errors.nationality = "Nationality is required";
				if (!formData.stateName) errors.stateName = "State name is required";
				if (!formData.gender) errors.gender = "Gender is required";
				if (!formData.bloodGroup) errors.bloodGroup = "Blood group is required";
				if (!formData.dateOfBirth) errors.dateOfBirth = "Date of birth is required";
				if (!formData.religion) errors.religion = "Religion is required";
				if (!formData.community) errors.community = "Community is required";
				if (!formData.caste) errors.caste = "Caste is required";
				if (!formData.communityCertificateNumber) errors.communityCertificateNumber = "Community certificate number is required";
				if (!formData.aadhaarNumber) errors.aadhaarNumber = "Aadhaar number is required";
				if (!formData.firstGraduate) errors.firstGraduate = "First graduate status is required";
				if (!formData.specialQuota) errors.specialQuota = "Special quota status is required";
				if (!formData.differentlyAbled) errors.differentlyAbled = "Differently abled status is required";
				break;
				
			case 1: // Contact Information
				if (!formData.mobileNumber) errors.mobileNumber = "Mobile number is required";
				if (!formData.emailId) errors.emailId = "Email ID is required";
				if (!formData.permanentAddress.state) errors.permanentState = "Permanent address state is required";
				if (!formData.permanentAddress.district) errors.permanentDistrict = "Permanent address district is required";
				if (!formData.permanentAddress.postalAddress) errors.permanentPostalAddress = "Permanent postal address is required";
				break;
				
			case 2: // Family Information
				if (!formData.fatherName) errors.fatherName = "Father's name is required";
				if (!formData.motherName) errors.motherName = "Mother's name is required";
				if (!formData.isOrphan) errors.isOrphan = "Orphan status is required";
				if (!formData.familyAnnualIncome) errors.familyAnnualIncome = "Family annual income is required";
				if (!formData.parentMobileNumber) errors.parentMobileNumber = "Parent mobile number is required";
				break;
				
			case 3: // Bank Information
				if (!formData.accountNumber) errors.accountNumber = "Account number is required";
				if (!formData.ifscCode) errors.ifscCode = "IFSC code is required";
				if (!formData.bankName) errors.bankName = "Bank name is required";
				if (!formData.bankBranch) errors.bankBranch = "Bank branch is required";
				if (!formData.city) errors.city = "City is required";
				break;
				
			case 4: // Academic Information
				if (!formData.academicYear) errors.academicYear = "Academic year is required";
				if (!formData.streamType) errors.streamType = "Stream type is required";
				if (!formData.courseType) errors.courseType = "Course type is required";
				if (!formData.course) errors.course = "Course is required";
				if (!formData.branchSpecialization) errors.branchSpecialization = "Branch/Specialization is required";
				if (!formData.mediumOfInstruction) errors.mediumOfInstruction = "Medium of instruction is required";
				if (!formData.modeOfStudy) errors.modeOfStudy = "Mode of study is required";
				if (!formData.dateOfAdmission) errors.dateOfAdmission = "Date of admission is required";
				if (!formData.yearOfStudy) errors.yearOfStudy = "Year of study is required";
				break;
		}
		
		setValidationErrors(errors);
		return Object.keys(errors).length === 0;
	};

	const handleNext = () => {
		if (validateCurrentStep() && currentStep < steps.length - 1) {
			setCurrentStep(prev => prev + 1);
		}
	};

	const handlePrevious = () => {
		if (currentStep > 0) {
			setCurrentStep(prev => prev - 1);
		}
	};

	const handleStepClick = (stepId: string) => {
		const stepIndex = steps.findIndex(step => step.id === stepId);
		if (stepIndex !== -1 && stepIndex <= currentStep + 1) {
			setCurrentStep(stepIndex);
		}
	};

	const renderCurrentTab = () => {
		switch (currentStep) {
			case 0:
				return (
					<GeneralInformationTab
						formData={formData}
						updateFormData={updateFormData}
						validationErrors={validationErrors}
						currentToken={currentToken}
					/>
				);
			case 1:
				return (
					<ContactInformationTab
						formData={formData}
						updateFormData={updateFormData}
						validationErrors={validationErrors}
						currentToken={currentToken}
					/>
				);
			case 2:
				return (
					<FamilyInformationTab
						formData={formData}
						updateFormData={updateFormData}
						validationErrors={validationErrors}
						currentToken={currentToken}
					/>
				);
			case 3:
				return (
					<BankInformationTab
						formData={formData}
						updateFormData={updateFormData}
						validationErrors={validationErrors}
						currentToken={currentToken}
					/>
				);
			case 4:
				return (
					<AcademicInformationTab
						formData={formData}
						updateFormData={updateFormData}
						validationErrors={validationErrors}
						currentToken={currentToken}
					/>
				);
			case 5:
				return (
					<CompletionTab
						formData={formData}
						currentToken={currentToken}
					/>
				);
			default:
				return null;
		}
	};

	return (
		<Card className="w-full max-w-4xl mx-auto">
			<CardHeader>
				<CardTitle className="text-2xl text-center text-blue-600">
					Student Registration
				</CardTitle>
				<CardDescription className="text-center">
					Complete all sections to register with UMIS
				</CardDescription>
			</CardHeader>
			
			<CardContent>
				{/* Progress Stepper */}
				<ProgressStepper
					steps={steps}
					onStepClick={handleStepClick}
					className="mb-8"
				/>
				
				{/* Current Tab Content */}
				<div className="min-h-96">
					{renderCurrentTab()}
				</div>
				
				{/* Navigation Buttons */}
				<div className="flex justify-between mt-8 pt-6 border-t">
					<Button
						variant="outline"
						onClick={handlePrevious}
						disabled={currentStep === 0}
						className="flex items-center gap-2"
					>
						<ArrowLeft className="w-4 h-4" />
						Previous
					</Button>
					
					{currentStep < steps.length - 1 ? (
						<Button
							onClick={handleNext}
							className="flex items-center gap-2"
						>
							Next
							<ArrowRight className="w-4 h-4" />
						</Button>
					) : (
						<Button
							onClick={() => {
								// Handle final submission
								console.log("Final form submission:", formData);
							}}
							className="bg-green-600 hover:bg-green-700"
						>
							Submit Registration
						</Button>
					)}
				</div>
			</CardContent>
		</Card>
	);
};