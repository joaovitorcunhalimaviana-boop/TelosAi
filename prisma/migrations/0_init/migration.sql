-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "crm" TEXT,
    "estado" TEXT,
    "whatsapp" TEXT,
    "role" TEXT NOT NULL DEFAULT 'medico',
    "plan" TEXT NOT NULL DEFAULT 'professional',
    "basePrice" DECIMAL(10,2) NOT NULL DEFAULT 500,
    "additionalPatientPrice" DECIMAL(10,2) NOT NULL DEFAULT 180,
    "isLifetimePrice" BOOLEAN NOT NULL DEFAULT false,
    "maxPatients" INTEGER NOT NULL DEFAULT 3,
    "currentPatients" INTEGER NOT NULL DEFAULT 0,
    "twilioSubaccountSid" TEXT,
    "whatsappNumber" TEXT,
    "whatsappConnected" BOOLEAN NOT NULL DEFAULT false,
    "aceitoTermos" BOOLEAN NOT NULL DEFAULT false,
    "aceitoNovidades" BOOLEAN NOT NULL DEFAULT false,
    "firstLogin" BOOLEAN NOT NULL DEFAULT true,
    "researchMode" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "age" INTEGER,
    "sex" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isResearchParticipant" BOOLEAN NOT NULL DEFAULT false,
    "researchGroup" TEXT,
    "researchNotes" TEXT,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comorbidity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comorbidity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientComorbidity" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "comorbidityId" TEXT NOT NULL,
    "details" TEXT,
    "severity" TEXT,

    CONSTRAINT "PatientComorbidity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Medication" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Medication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientMedication" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "medicationId" TEXT NOT NULL,
    "dose" TEXT,
    "frequency" TEXT,
    "route" TEXT,

    CONSTRAINT "PatientMedication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Surgery" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hospital" TEXT,
    "durationMinutes" INTEGER,
    "dataCompleteness" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "Surgery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurgeryDetails" (
    "id" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "hemorrhoidTechnique" TEXT,
    "hemorrhoidEnergyType" TEXT,
    "hemorrhoidNumMamillae" INTEGER,
    "hemorrhoidPositions" TEXT,
    "hemorrhoidType" TEXT,
    "hemorrhoidInternalGrade" TEXT,
    "hemorrhoidExternalDetails" TEXT,
    "fistulaType" TEXT,
    "fistulaTechnique" TEXT,
    "fistulaNumTracts" INTEGER,
    "fistulaSeton" BOOLEAN,
    "fistulaSetonMaterial" TEXT,
    "fissureType" TEXT,
    "fissureLocation" TEXT,
    "fissureTechnique" TEXT,
    "pilonidalTechnique" TEXT,
    "fullDescription" TEXT,
    "complications" TEXT,
    "recoveryRoomMinutes" INTEGER,
    "sameDayDischarge" BOOLEAN NOT NULL DEFAULT true,
    "hospitalizationDays" INTEGER,

    CONSTRAINT "SurgeryDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PreOpPreparation" (
    "id" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    "botoxUsed" BOOLEAN NOT NULL DEFAULT false,
    "botoxDate" TIMESTAMP(3),
    "botoxDoseUnits" INTEGER,
    "botoxLocation" TEXT,
    "botoxObservations" TEXT,
    "intestinalPrep" BOOLEAN NOT NULL DEFAULT false,
    "intestinalPrepType" TEXT,
    "otherPreparations" TEXT,

    CONSTRAINT "PreOpPreparation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Anesthesia" (
    "id" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "anesthesiologist" TEXT,
    "observations" TEXT,
    "pudendoBlock" BOOLEAN NOT NULL DEFAULT false,
    "pudendoTechnique" TEXT,
    "pudendoAccess" TEXT,
    "pudendoAnesthetic" TEXT,
    "pudendoConcentration" TEXT,
    "pudendoVolumeML" DOUBLE PRECISION,
    "pudendoLaterality" TEXT,
    "pudendoAdjuvants" TEXT,
    "pudendoDetails" TEXT,

    CONSTRAINT "Anesthesia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostOpPrescription" (
    "id" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    "ointments" TEXT,
    "medications" TEXT,

    CONSTRAINT "PostOpPrescription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentTerm" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "patientId" TEXT NOT NULL,
    "surgeryId" TEXT,
    "termType" TEXT NOT NULL,
    "signedPhysically" BOOLEAN NOT NULL DEFAULT false,
    "signedDate" TIMESTAMP(3),
    "pdfPath" TEXT,

    CONSTRAINT "ConsentTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUp" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "surgeryId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "scheduledDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" TIMESTAMP(3),
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "FollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FollowUpResponse" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "followUpId" TEXT NOT NULL,
    "questionnaireData" TEXT NOT NULL,
    "aiAnalysis" TEXT,
    "aiResponse" TEXT,
    "riskLevel" TEXT NOT NULL DEFAULT 'low',
    "redFlags" TEXT,
    "doctorAlerted" BOOLEAN NOT NULL DEFAULT false,
    "alertSentAt" TIMESTAMP(3),

    CONSTRAINT "FollowUpResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurgeryTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surgeryType" TEXT NOT NULL,
    "templateData" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SurgeryTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Research" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "surgeryType" TEXT,
    "totalPatients" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Research_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "researchId" TEXT NOT NULL,
    "groupCode" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "patientCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ResearchGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_plan_idx" ON "User"("plan");

-- CreateIndex
CREATE UNIQUE INDEX "User_crm_estado_key" ON "User"("crm", "estado");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_cpf_key" ON "Patient"("cpf");

-- CreateIndex
CREATE INDEX "Patient_userId_idx" ON "Patient"("userId");

-- CreateIndex
CREATE INDEX "Patient_phone_idx" ON "Patient"("phone");

-- CreateIndex
CREATE INDEX "Patient_cpf_idx" ON "Patient"("cpf");

-- CreateIndex
CREATE INDEX "Patient_isActive_idx" ON "Patient"("isActive");

-- CreateIndex
CREATE INDEX "Patient_name_idx" ON "Patient"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Comorbidity_name_key" ON "Comorbidity"("name");

-- CreateIndex
CREATE INDEX "Comorbidity_category_idx" ON "Comorbidity"("category");

-- CreateIndex
CREATE INDEX "Comorbidity_isActive_idx" ON "Comorbidity"("isActive");

-- CreateIndex
CREATE INDEX "PatientComorbidity_patientId_idx" ON "PatientComorbidity"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "PatientComorbidity_patientId_comorbidityId_key" ON "PatientComorbidity"("patientId", "comorbidityId");

-- CreateIndex
CREATE UNIQUE INDEX "Medication_name_key" ON "Medication"("name");

-- CreateIndex
CREATE INDEX "Medication_category_idx" ON "Medication"("category");

-- CreateIndex
CREATE INDEX "Medication_isActive_idx" ON "Medication"("isActive");

-- CreateIndex
CREATE INDEX "PatientMedication_patientId_idx" ON "PatientMedication"("patientId");

-- CreateIndex
CREATE INDEX "Surgery_userId_idx" ON "Surgery"("userId");

-- CreateIndex
CREATE INDEX "Surgery_patientId_idx" ON "Surgery"("patientId");

-- CreateIndex
CREATE INDEX "Surgery_date_idx" ON "Surgery"("date");

-- CreateIndex
CREATE INDEX "Surgery_type_idx" ON "Surgery"("type");

-- CreateIndex
CREATE UNIQUE INDEX "SurgeryDetails_surgeryId_key" ON "SurgeryDetails"("surgeryId");

-- CreateIndex
CREATE INDEX "SurgeryDetails_userId_idx" ON "SurgeryDetails"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PreOpPreparation_surgeryId_key" ON "PreOpPreparation"("surgeryId");

-- CreateIndex
CREATE UNIQUE INDEX "Anesthesia_surgeryId_key" ON "Anesthesia"("surgeryId");

-- CreateIndex
CREATE UNIQUE INDEX "PostOpPrescription_surgeryId_key" ON "PostOpPrescription"("surgeryId");

-- CreateIndex
CREATE INDEX "ConsentTerm_patientId_idx" ON "ConsentTerm"("patientId");

-- CreateIndex
CREATE INDEX "ConsentTerm_surgeryId_idx" ON "ConsentTerm"("surgeryId");

-- CreateIndex
CREATE INDEX "FollowUp_userId_idx" ON "FollowUp"("userId");

-- CreateIndex
CREATE INDEX "FollowUp_surgeryId_idx" ON "FollowUp"("surgeryId");

-- CreateIndex
CREATE INDEX "FollowUp_patientId_idx" ON "FollowUp"("patientId");

-- CreateIndex
CREATE INDEX "FollowUp_scheduledDate_idx" ON "FollowUp"("scheduledDate");

-- CreateIndex
CREATE INDEX "FollowUp_status_idx" ON "FollowUp"("status");

-- CreateIndex
CREATE INDEX "FollowUpResponse_userId_idx" ON "FollowUpResponse"("userId");

-- CreateIndex
CREATE INDEX "FollowUpResponse_followUpId_idx" ON "FollowUpResponse"("followUpId");

-- CreateIndex
CREATE INDEX "FollowUpResponse_riskLevel_idx" ON "FollowUpResponse"("riskLevel");

-- CreateIndex
CREATE INDEX "SurgeryTemplate_userId_idx" ON "SurgeryTemplate"("userId");

-- CreateIndex
CREATE INDEX "SurgeryTemplate_surgeryType_idx" ON "SurgeryTemplate"("surgeryType");

-- CreateIndex
CREATE INDEX "SurgeryTemplate_isDefault_idx" ON "SurgeryTemplate"("isDefault");

-- CreateIndex
CREATE INDEX "SurgeryTemplate_isActive_idx" ON "SurgeryTemplate"("isActive");

-- CreateIndex
CREATE INDEX "Research_userId_idx" ON "Research"("userId");

-- CreateIndex
CREATE INDEX "Research_isActive_idx" ON "Research"("isActive");

-- CreateIndex
CREATE INDEX "Research_surgeryType_idx" ON "Research"("surgeryType");

-- CreateIndex
CREATE INDEX "ResearchGroup_researchId_idx" ON "ResearchGroup"("researchId");

-- CreateIndex
CREATE UNIQUE INDEX "ResearchGroup_researchId_groupCode_key" ON "ResearchGroup"("researchId", "groupCode");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientComorbidity" ADD CONSTRAINT "PatientComorbidity_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientComorbidity" ADD CONSTRAINT "PatientComorbidity_comorbidityId_fkey" FOREIGN KEY ("comorbidityId") REFERENCES "Comorbidity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientMedication" ADD CONSTRAINT "PatientMedication_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "Medication"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Surgery" ADD CONSTRAINT "Surgery_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurgeryDetails" ADD CONSTRAINT "SurgeryDetails_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurgeryDetails" ADD CONSTRAINT "SurgeryDetails_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreOpPreparation" ADD CONSTRAINT "PreOpPreparation_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Anesthesia" ADD CONSTRAINT "Anesthesia_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostOpPrescription" ADD CONSTRAINT "PostOpPrescription_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentTerm" ADD CONSTRAINT "ConsentTerm_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentTerm" ADD CONSTRAINT "ConsentTerm_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_surgeryId_fkey" FOREIGN KEY ("surgeryId") REFERENCES "Surgery"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUp" ADD CONSTRAINT "FollowUp_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpResponse" ADD CONSTRAINT "FollowUpResponse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowUpResponse" ADD CONSTRAINT "FollowUpResponse_followUpId_fkey" FOREIGN KEY ("followUpId") REFERENCES "FollowUp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurgeryTemplate" ADD CONSTRAINT "SurgeryTemplate_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Research" ADD CONSTRAINT "Research_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchGroup" ADD CONSTRAINT "ResearchGroup_researchId_fkey" FOREIGN KEY ("researchId") REFERENCES "Research"("id") ON DELETE CASCADE ON UPDATE CASCADE;

