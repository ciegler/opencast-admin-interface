import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import NewEventSummary from "./NewEventSummary";
import NewAssetUploadPage from "../ModalTabsAndPages/NewAssetUploadPage";
import NewMetadataExtendedPage from "../ModalTabsAndPages/NewMetadataExtendedPage";
import NewAccessPage from "../ModalTabsAndPages/NewAccessPage";
import NewProcessingPage from "../ModalTabsAndPages/NewProcessingPage";
import NewSourcePage from "../ModalTabsAndPages/NewSourcePage";
import { NewEventSchema, MetadataSchema } from "../../../../utils/validate";
import { getInitialMetadataFieldValues } from "../../../../utils/resourceUtils";
import { sourceMetadata } from "../../../../configs/sourceConfig";
import { initialFormValuesNewEvents } from "../../../../configs/modalConfig";
import {
	getAssetUploadOptions,
	getEventMetadata,
	getExtendedEventMetadata,
	getSourceUploadOptions,
} from "../../../../selectors/eventSelectors";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { getOrgProperties, getUserInformation } from "../../../../selectors/userInfoSelectors";
import { MetadataCatalog, UploadOption, postNewEvent } from "../../../../slices/eventSlice";
import { UserInfoState } from "../../../../slices/userInfoSlice";
import { removeNotificationWizardForm } from "../../../../slices/notificationSlice";
import NewMetadataCommonPage from "../ModalTabsAndPages/NewMetadataCommonPage";
import WizardStepper from "../../../shared/wizard/WizardStepper";
import { ParseKeys } from "i18next";

/**
 * This component manages the pages of the new event wizard and the submission of values
 */
const NewEventWizard: React.FC<{
	close: () => void
}> = ({
	close,
}) => {
	const dispatch = useAppDispatch();

	const uploadSourceOptions = useAppSelector(state => getSourceUploadOptions(state));
	const assetUploadOptions = useAppSelector(state => getAssetUploadOptions(state));
	const metadataFields = useAppSelector(state => getEventMetadata(state));
	const extendedMetadata = useAppSelector(state => getExtendedEventMetadata(state));
	const user = useAppSelector(state => getUserInformation(state));
	const orgProperties = useAppSelector(state => getOrgProperties(state));

	useEffect(() => {
		dispatch(removeNotificationWizardForm());

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// Whether the ACL of a new event is initialized with the ACL of its series.
	let initEventAclWithSeriesAcl = true
	const ADMIN_INIT_EVENT_ACL_WITH_SERIES_ACL = "admin.init.event.acl.with.series.acl";
	if (!!orgProperties && !!orgProperties[ADMIN_INIT_EVENT_ACL_WITH_SERIES_ACL]) {
		initEventAclWithSeriesAcl = user.org.properties[ADMIN_INIT_EVENT_ACL_WITH_SERIES_ACL] === 'true';
	}

	const initialValues = getInitialValues(
		metadataFields,
		extendedMetadata,
		uploadSourceOptions,
		user,
	);

	const [page, setPage] = useState(0);
	const [snapshot, setSnapshot] = useState(initialValues);
	const [pageCompleted, setPageCompleted] = useState<{ [key: number]: boolean }>({});

	// Caption of steps used by Stepper
	const steps: {
		translation: ParseKeys,
		name: string,
		hidden: boolean,
	}[] = [
		{
			translation: "EVENTS.EVENTS.NEW.METADATA.CAPTION",
			name: "metadata",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.DETAILS.TABS.EXTENDED-METADATA",
			name: "metadata-extended",
			hidden: !(!!extendedMetadata && extendedMetadata.length > 0),
		},
		{
			translation: "EVENTS.EVENTS.NEW.SOURCE.CAPTION",
			name: "source",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.NEW.UPLOAD_ASSET.CAPTION",
			name: "upload-asset",
			hidden: assetUploadOptions.length === 0,
		},
		{
			translation: "EVENTS.EVENTS.NEW.PROCESSING.CAPTION",
			name: "processing",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.NEW.ACCESS.CAPTION",
			name: "access",
			hidden: false,
		},
		{
			translation: "EVENTS.EVENTS.NEW.SUMMARY.CAPTION",
			name: "summary",
			hidden: false,
		},
	];

	// Validation schema of current page
	let currentValidationSchema;
	if (page === 0 || page === 1) {
		currentValidationSchema = MetadataSchema(metadataFields);
	} else {
		currentValidationSchema = NewEventSchema[page];
	}

	const nextPage = (values: typeof initialValues) => {
		setSnapshot(values);

		// set page as completely filled out
		let updatedPageCompleted = pageCompleted;
		updatedPageCompleted[page] = true;
		setPageCompleted(updatedPageCompleted);

		let newPage = page;
		do {
			newPage = newPage + 1;
			// Skip asset upload step when scheduling
			if (steps[newPage].name === "upload-asset" && values.sourceMode !== "UPLOAD") {
				newPage = newPage + 1;
			}
		} while(steps[newPage] && steps[newPage].hidden);
		if (steps[newPage]) {
			setPage(newPage)
		}
	};

	const previousPage = (values: typeof initialValues) => {
		setSnapshot(values);

		let newPage = page;
		do {
			newPage = newPage - 1;
			// Skip asset upload step when scheduling
			if (steps[newPage].name === "upload-asset" && values.sourceMode !== "UPLOAD") {
				newPage = newPage - 1;
			}
		} while(steps[newPage] && steps[newPage].hidden);
		if (steps[newPage]) {
			setPage(newPage)
		}
	};

	const handleSubmit = (values: typeof initialValues) => {
		const response = dispatch(postNewEvent({values, metadataInfo: metadataFields, extendedMetadata}));
		console.info(response);
		close();
	};

	return (
		<>
			<Formik
				initialValues={snapshot}
				validationSchema={currentValidationSchema}
				onSubmit={(values) => handleSubmit(values)}
			>
				{/* Render wizard pages depending on current value of page variable */}
				{(formik) => {
					// eslint-disable-next-line react-hooks/rules-of-hooks
					useEffect(() => {
						formik.validateForm();
						// eslint-disable-next-line react-hooks/exhaustive-deps
					}, [page]);

					return (
						<>
							{/* Stepper that shows each step of wizard as header */}
							<WizardStepper
								steps={steps}
								page={page}
								setPage={setPage}
								completed={pageCompleted}
								setCompleted={setPageCompleted}
								formik={formik}
								hasAccessPage
							/>
							<div>
								{page === 0 && (
									<NewMetadataCommonPage
										nextPage={nextPage}
										formik={formik}
										metadataFields={metadataFields}
										header={steps[page].translation}
									/>
								)}
								{page === 1 && (
									<NewMetadataExtendedPage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
										extendedMetadataFields={extendedMetadata}
									/>
								)}
								{page === 2 && (
									<NewSourcePage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
									/>
								)}
								{page === 3 && (
									<NewAssetUploadPage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
									/>
								)}
								{page === 4 && (
									<NewProcessingPage
										previousPage={previousPage}
										nextPage={nextPage}
										formik={formik}
									/>
								)}
								{page === 5 && (
									<NewAccessPage
									// @ts-expect-error TS(7006):
										previousPage={previousPage}
										// @ts-expect-error TS(7006):
										nextPage={nextPage}
										// @ts-expect-error TS(7006):
										formik={formik}
										editAccessRole="ROLE_UI_SERIES_DETAILS_ACL_EDIT"
										initEventAclWithSeriesAcl={initEventAclWithSeriesAcl}
									/>
								)}
								{page === 6 && (
									<NewEventSummary
										previousPage={previousPage}
										formik={formik}
										metaDataExtendedHidden={steps[1].hidden}
										assetUploadHidden={steps[3].hidden}
									/>
								)}
							</div>
						</>
					);
				}}
			</Formik>
		</>
	);
};

// Transform all initial values needed from information provided by backend
const getInitialValues = (
	metadataFields: MetadataCatalog,
	extendedMetadata: MetadataCatalog[],
	uploadSourceOptions: UploadOption[],
	user: UserInfoState
) => {
	let initialValues = initialFormValuesNewEvents;

	// Transform metadata fields provided by backend (saved in redux)
	initialValues = {...initialValues, ...getInitialMetadataFieldValues(
		metadataFields
	)};

	for (const catalog of extendedMetadata) {
		initialValues = {...initialValues, ...getInitialMetadataFieldValues(
			catalog
		)};
	}

	// Update start date for uploads
	if (sourceMetadata?.UPLOAD?.metadata?.[0]) {
		sourceMetadata.UPLOAD.metadata[0].value = new Date().toISOString();
	}

	// Transform additional metadata for source (provided by constant in newEventConfig)
	if (!!sourceMetadata.UPLOAD) {
		sourceMetadata.UPLOAD.metadata.forEach((field) => {
			initialValues[field.id] = field.value;
		});
	}
	if (!!sourceMetadata.SCHEDULE_SINGLE) {
		sourceMetadata.SCHEDULE_SINGLE.metadata.forEach((field) => {
			initialValues[field.id] = field.value;
		});
	}
	if (!!sourceMetadata.SCHEDULE_MULTIPLE) {
		sourceMetadata.SCHEDULE_MULTIPLE.metadata.forEach((field) => {
			initialValues[field.id] = field.value;
		});
	}

	// Add possible files that can be uploaded in source step
	if (!!uploadSourceOptions) {
		initialValues.uploadAssetsTrack = [];
		// Sort by displayOrder
		uploadSourceOptions = uploadSourceOptions.slice().sort((a, b) => a.displayOrder - b.displayOrder)
		// initial value of upload asset needs to be null, because object (file) is saved there
		for (const option of uploadSourceOptions) {
			initialValues.uploadAssetsTrack.push({
				...option,
				file: undefined,
			});
		};
	}

	// Add all initial form values known upfront listed in newEventsConfig
	for (const [key, value] of Object.entries(initialFormValuesNewEvents)) {
		initialValues[key] = value;
	}

	const defaultDate = new Date();

	// fill times with some default values
	initialValues["scheduleStartHour"] = (defaultDate.getHours() + 1).toString();
	initialValues["scheduleStartMinute"] = "00";
	initialValues["scheduleDurationHours"] = "00";
	initialValues["scheduleDurationMinutes"] = "55";
	initialValues["scheduleEndHour"] = (defaultDate.getHours() + 1).toString();
	initialValues["scheduleEndMinute"] = "55";

	initialValues["acls"] = [
		{
			role: user.userRole,
			read: true,
			write: true,
			actions: [],
		},
	];

	return initialValues;
};

export default NewEventWizard;
