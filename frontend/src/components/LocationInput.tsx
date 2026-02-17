import { FaMapMarkerAlt } from 'react-icons/fa';
import LocationPickerSimple from './LocationPickerSimple';

interface Props {
  label: string;
  value: string;
  onChange: (val: string) => void;
}

const LocationInput: React.FC<Props> = ({ label, value, onChange }) => {
  return (
    <div className="form-group">
      <label><FaMapMarkerAlt /> {label}</label>
      <LocationPickerSimple value={value} onChange={onChange} placeholder={`Enter ${label.toLowerCase()}`} />
    </div>
  );
};

export default LocationInput;
