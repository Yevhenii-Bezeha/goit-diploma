import { useField } from 'formik';
import { useGetUserArtistQuery } from '../../../redux/userArtist/userArtistApi';

type OfficeSelectorProps = {
  name: string;
  className?: string;
  label?: string;
  required?: boolean;
};

export const OfficeSelector = ({ name, className = '', label = 'Artist Profile', required = false }: OfficeSelectorProps) => {
  const [field, meta, helpers] = useField(name);
  const { data: user, isLoading, isError } = useGetUserArtistQuery();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    helpers.setValue(value === '' ? null : value);
  };

  // Simplified options for diploma version
  const profileOptions = [
    { value: 'solo', label: 'Solo Artist' },
    { value: 'band', label: 'Band Member' },
    { value: 'producer', label: 'Producer' },
    { value: 'label', label: 'Record Label' },
  ];

  return (
    <div className={`flex flex-col ${className}`}>
      <label htmlFor={name} className="text-white text-sm font-medium mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          className={`bg-[#1F1B29] text-white border rounded-lg p-3 w-full appearance-none ${meta.touched && meta.error ? 'border-red-500' : 'border-[#35263D]'
            }`}
          value={field.value || ''}
          onChange={handleChange}
          onBlur={field.onBlur}
          disabled={isLoading}
        >
          <option value="">Select your artist type (optional)</option>
          {profileOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </div>
      {isLoading && <p className="text-sm text-gray-400 mt-1">Loading profile...</p>}
      {isError && <p className="text-sm text-red-500 mt-1">Failed to load profile</p>}
      {meta.touched && meta.error && <p className="text-sm text-red-500 mt-1">{meta.error}</p>}
    </div>
  );
};
