import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiFetch from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Props = {
  isOpen: boolean;
  initialNin?: string;
  onClose: () => void;
  onSuccess: (ninInfo: any) => void;
};

const NinRegisterModal: React.FC<Props> = ({ isOpen, initialNin = '', onClose, onSuccess }) => {
  const [nin, setNin] = useState(initialNin);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stateField, setStateField] = useState('');
  const [region, setRegion] = useState('');
  const [occupation, setOccupation] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');
  const [lga, setLga] = useState('');
  const [tribe, setTribe] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  if (!isOpen) return null;

  const validate = () => {
    if (!/^\d{11}$/.test(nin)) return t('ninRegister.validation.nin');
    if (!fullName.trim()) return t('ninRegister.validation.fullName');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return t('ninRegister.validation.email');
    if (phone.trim().length < 7) return t('ninRegister.validation.phone');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: t('invalidInputTitle'), description: err, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        nin,
        fullName,
        email,
        phone,
        state: stateField || undefined,
        region: region || undefined,
        occupation: occupation || undefined,
        gender: gender || undefined,
        dob: dob || undefined,
        address: address || undefined,
        lga: lga || undefined,
        tribe: tribe || undefined,
      };

      const created = await apiFetch('/api/nininfo', { method: 'POST', body: JSON.stringify(payload) });
      toast({ title: t('ninRegister.successTitle'), description: t('ninRegister.successDesc') });
      onSuccess(created);
      onClose();
    } catch (err: any) {
      const message = err?.message || t('serverError');
      toast({ title: t('ninRegister.failTitle'), description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-lg mx-4 rounded shadow-lg p-6 z-10 max-h-[100vh]">
        <h3 className="text-lg font-semibold mb-3">{t('ninRegister.title')}</h3>
        <p className="text-sm text-muted-foreground mb-4">{t('ninRegister.notice')}</p>
        <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto max-h-[65vh] pr-2">
          <div className="grid grid-cols-1 gap-2">
            <div>
              <Label htmlFor="modal-nin">{t('ninRegister.ninLabel')}</Label>
              <Input id="modal-nin" name="nin" value={nin} onChange={(e) => setNin(e.target.value)} maxLength={11} />
            </div>
            <div>
              <Label htmlFor="modal-fullname">{t('ninRegister.fullName')}</Label>
              <Input id="modal-fullname" name="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-email">{t('ninRegister.email')}</Label>
              <Input id="modal-email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-phone">{t('ninRegister.phone')}</Label>
              <Input id="modal-phone" name="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-state">{t('ninRegister.state')}</Label>
              <Input id="modal-state" name="state" value={stateField} onChange={(e) => setStateField(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-region">{t('ninRegister.region')}</Label>
              <Input id="modal-region" name="region" value={region} onChange={(e) => setRegion(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-occupation">{t('ninRegister.occupation')}</Label>
              <Input id="modal-occupation" name="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-gender">{t('ninRegister.gender')}</Label>
              <select id="modal-gender" name="gender" value={gender} onChange={(e) => setGender(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="">{t('selectPlaceholder')}</option>
                <option value="male">{t('genderOptions.male')}</option>
                <option value="female">{t('genderOptions.female')}</option>
                <option value="other">{t('genderOptions.other')}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="modal-dob">{t('ninRegister.dateOfBirth')}</Label>
              <Input id="modal-dob" name="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-address">{t('ninRegister.address')}</Label>
              <Input id="modal-address" name="address" value={address} onChange={(e) => setAddress(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-lga">{t('ninRegister.lga')}</Label>
              <Input id="modal-lga" name="lga" value={lga} onChange={(e) => setLga(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="modal-tribe">{t('ninRegister.tribe')}</Label>
              <Input id="modal-tribe" name="tribe" value={tribe} onChange={(e) => setTribe(e.target.value)} />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>{t('cancel')}</Button>
            <Button type="submit" disabled={submitting}>{submitting ? t('saving') : t('ninRegister.submit')}</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NinRegisterModal;
