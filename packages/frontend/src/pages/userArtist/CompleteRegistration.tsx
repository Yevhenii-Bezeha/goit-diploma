import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, NavLink } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FormInput, FormSelect } from '../../components/shared/FormFields';
import { Button } from '../../components/shared';
import { ALLOWED_COUNTRIES } from '../../constants/allowedCountries';
import { useCompleteGoogleRegistrationMutation } from '../../redux/userArtist/authApi';
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

const countryOptions = Object.entries(ALLOWED_COUNTRIES)
  .map(([value, label]) => ({
    value,
    label,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

interface GoogleUserInfo {
  email: string;
  google_id: string;
  first_name: string;
  last_name: string;
  image_url: string;
  auth_type: 'google';
}

interface FormValues {
  phoneNumber: string;
  country: string;
}

const validationSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^[+]?[\d\s-]{10,}$/, 'Please enter a valid phone number (e.g., +31 6 51683333)')
    .required('Phone number is required'),
  country: Yup.string()
    .oneOf(Object.keys(ALLOWED_COUNTRIES), 'Please select a valid country')
    .required('Country of residence is required'),
});

const CompleteRegistration = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<GoogleUserInfo | null>(null);
  const [completeRegistration, { isLoading, error: completeRegistrationError }] =
    useCompleteGoogleRegistrationMutation();
  const error = completeRegistrationError as FetchBaseQueryError;

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      navigate('/for-artists');
      return;
    }

    try {
      const decoded = jwtDecode<GoogleUserInfo>(token);
      setUserInfo(decoded);
    } catch (error) {
      console.error('Invalid token:', error);
      navigate('/for-artists');
    }
  }, [searchParams, navigate]);

  const handleSubmit = async (values: FormValues) => {
    if (!userInfo) return;

    try {
      const token = searchParams.get('token');
      if (!token) {
        console.error('Token not found in search params');
        return;
      }

      const payload = {
        token,
        phone_number: values.phoneNumber,
        type: 'Artist',
        country: values.country,
        accepted_terms_and_conditions: true,
        role: 'Artist',
      };

      await completeRegistration(payload).unwrap();
      navigate('/for-artists/artists');
    } catch (err) {
      console.error('Registration completion failed:', err);
    }
  };

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex justify-center items-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  const initialValues: FormValues = {
    phoneNumber: '',
    country: '',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white p-8">
      <div className="max-w-md mx-auto">
        {/* Academic/Prototype Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 text-white">
            Listener-Driven Micro-Donations
          </h1>
          <p className="text-sm text-blue-200 mb-4">
            Academic Prototype - Artist Registration
          </p>
          <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-blue-400 mx-auto rounded"></div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-2 text-center">
            Welcome, {userInfo.first_name}!
          </h2>
          <p className="text-sm text-gray-300 text-center">
            Complete your artist profile to start receiving micro-donations from listeners
          </p>
        </div>

        {/* User Info Display */}
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {userInfo.image_url && (
              <img
                src={userInfo.image_url}
                alt="Profile"
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{userInfo.first_name} {userInfo.last_name}</p>
              <p className="text-sm text-gray-400">{userInfo.email}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Using Google account for authentication
          </p>
        </div>

        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ values, errors, touched }) => (
            <Form className="space-y-4">
              <FormSelect
                label="Country of Residence"
                name="country"
                options={countryOptions}
                placeholder="Select your country"
                required
              />
              {errors.country && touched.country && (
                <div className="text-red-300 text-sm">{errors.country}</div>
              )}

              <FormInput
                label="Phone Number"
                name="phoneNumber"
                type="tel"
                placeholder="+31 6 51683333"
                required
              />
              {errors.phoneNumber && touched.phoneNumber && (
                <div className="text-red-300 text-sm">{errors.phoneNumber}</div>
              )}

              {/* Academic Context */}
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg p-4 mt-6">
                <h3 className="text-sm font-medium text-blue-200 mb-2">Research Context</h3>
                <p className="text-xs text-gray-300">
                  This prototype demonstrates a novel approach to artist compensation in music streaming.
                  Your participation helps evaluate the effectiveness of listener-driven micro-donations.
                </p>
              </div>

              {/* Terms */}
              <div className="text-xs text-gray-400 mt-4">
                By completing registration, you agree to our{' '}
                <NavLink to="/terms/artists" className="text-blue-300 hover:underline" target="_blank">
                  Terms of Service
                </NavLink>{' '}
                and{' '}
                <NavLink to="/privacy" className="text-blue-300 hover:underline" target="_blank">
                  Privacy Policy
                </NavLink>
                .
              </div>

              <Button
                type="submit"
                className="w-full p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg font-medium transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? 'Setting up your artist profile...' : 'Complete Artist Registration'}
              </Button>
            </Form>
          )}
        </Formik>

        {/* Academic Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">
            Academic Research Project - University Diploma
          </p>
          <p className="text-xs text-gray-500 mt-1">
            System Design and Evaluation of Micro-Donation Platforms
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompleteRegistration;
