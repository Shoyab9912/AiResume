import React from "react";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";

interface BasicsFormProps {
  basics: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
  };
  summary: string;
  onChangeBasics: (key: string, value: string) => void;
  onChangeSummary: (value: string) => void;
}

export const BasicsForm: React.FC<BasicsFormProps> = ({
  basics,
  summary,
  onChangeBasics,
  onChangeSummary,
}) => {
  


  
  return (
    <div className="glass-card overflow-hidden">
      <div className="px-6 py-4 border-b border-white/6">
        <span className="text-sm font-semibold text-white/85">Personal Details</span>
      </div>
      <div className="p-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={basics.name}
            onChange={(e) => onChangeBasics("name", e.target.value)}
            placeholder="John Doe"
          />
          <Input
            label="Email"
            value={basics.email}
            onChange={(e) => onChangeBasics("email", e.target.value)}
            placeholder="john@doe.com"
          />
          <Input
            label="Phone"
            value={basics.phone}
            onChange={(e) => onChangeBasics("phone", e.target.value)}
            placeholder="+91 1234567890"
          />
          <Input
            label="Location"
            value={basics.location}
            onChange={(e) => onChangeBasics("location", e.target.value)}
            placeholder="Ranchi, India"
          />
          <div className="sm:col-span-2">
            <Input
              label="Linkedin Url"
              value={basics.linkedin}
              onChange={(e) => onChangeBasics("linkedin", e.target.value)}
              placeholder="linkedin.com/in/username"
            />
          </div>
          <div className="sm:col-span-2">
            <Textarea
              label="Professional Summary (AI will enhance it)"
              value={summary}
              onChange={(e) => onChangeSummary(e.target.value)}
              placeholder="Brief summary of your experience and goals..."
              rows={3}
            />
          </div>
        </div>
      </div>
    </div>
  );
};