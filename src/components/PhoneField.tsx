import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { cn } from "@/lib/utils";

interface PhoneFieldProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  placeholder?: string;
}

/**
 * Phone input with country flag selector.
 * Stores values in E.164 format (e.g. "+2250708441208").
 * Default country: Côte d'Ivoire.
 */
const PhoneField = ({ value, onChange, className, placeholder = "Numéro de téléphone" }: PhoneFieldProps) => {
  return (
    <div
      className={cn(
        "phone-field flex items-center gap-2 rounded-md border border-input bg-background px-3 h-10 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 ring-offset-background",
        className,
      )}
    >
      <PhoneInput
        international
        defaultCountry="CI"
        countryCallingCodeEditable={false}
        value={value || undefined}
        onChange={(v) => onChange(v || "")}
        placeholder={placeholder}
        className="flex-1 flex items-center gap-2 text-sm"
        numberInputProps={{
          className:
            "flex-1 bg-transparent outline-none border-0 placeholder:text-muted-foreground text-foreground min-w-0",
        }}
      />
    </div>
  );
};

export default PhoneField;
