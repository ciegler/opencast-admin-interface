import { Formik } from "formik";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getUserDetails } from "../../../selectors/userDetailsSelectors";
import ModalContent from "./ModalContent";
import { updateUserPassword } from "../../../slices/userDetailsSlice";
import { NotificationComponent } from "../Notifications";
import { Field } from "../Field";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { PasswordSchema } from "../../../utils/validate";
import { Modal, ModalHandle } from "./Modal";
import WizardNavigationButtons from "../wizard/WizardNavigationButtons";

/**
 * This component allows the current user to change their password.
 */
const ChangePasswordModal = ({
  modalRef,
}: {
  modalRef: React.RefObject<ModalHandle | null>
}) => {
  const { t } = useTranslation();

  const hideModal = () => {
    modalRef.current?.close?.();
  };


  return (
    <Modal
      header={t("CHANGE_PASSWORD_MODAL.TITLE")}
      classId="theme-details-modal"
      ref={modalRef}
    >
      {/* component that manages tabs of theme details modal*/}
      <ChangePassword
        close={hideModal}
      />
    </Modal>
  );
};

const ChangePassword = ({
  close,
}: {
  close: () => void,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const userDetails = useAppSelector(state => getUserDetails(state));

  const initialValues = {
    password: "",
    passwordConfirmation: "",
  };

  const handleSubmit = (values: {
    password: string,
  }) => {
    dispatch(updateUserPassword({ password: values.password }));
    close();
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={PasswordSchema}
      onSubmit={values => handleSubmit(values)}
    >
      {formik => (
        <>
        <ModalContent>
          <div className="form-container">
            {!userDetails.manageable && (
              <NotificationComponent
                notification={{
                  type: "warning",
                  message: "NOTIFICATIONS.USER_NOT_MANAGEABLE",
                  id: 0,
                }}
              />
            )}
            <div className="row">
              <label>{t("USERS.USERS.DETAILS.FORM.PASSWORD")}</label>
              <Field
                type="password"
                name="password"
                disabled={!userDetails.manageable}
                className={cn({
                  error: formik.touched.password && formik.errors.password,
                  disabled: !userDetails.manageable,
                })}
                placeholder={t("USERS.USERS.DETAILS.FORM.PASSWORD") + "..."}
              />
            </div>
            <div className="row">
              <label>{t("USERS.USERS.DETAILS.FORM.REPEAT_PASSWORD")}</label>
              <Field
                type="password"
                name="passwordConfirmation"
                disabled={!userDetails.manageable}
                className={cn({
                  error:
                    formik.touched.passwordConfirmation &&
                    formik.errors.passwordConfirmation,
                  disabled: !userDetails.manageable,
                })}
                placeholder={
                  t("USERS.USERS.DETAILS.FORM.REPEAT_PASSWORD") + "..."
                }
              />
            </div>
          </div>
        </ModalContent>
        <WizardNavigationButtons
          formik={formik}
          previousPage={close}
          createTranslationString="SUBMIT"
          cancelTranslationString="CANCEL"
          isLast
        />
        </>
      )}
    </Formik>
  );
};

export default ChangePasswordModal;
