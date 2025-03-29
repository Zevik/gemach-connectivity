import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Mail } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';

const GemachDetail = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGemach, setSelectedGemach] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleOpenGemach = (gemach) => {
    setSelectedGemach(gemach);
    setIsOpen(true);
  };

  const handleCloseGemach = () => {
    setIsOpen(false);
    setSelectedGemach(null);
  };

  const handleContactOpen = () => {
    setContactModalOpen(true);
  };

  const handleContactClose = () => {
    setContactModalOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setContactModalOpen(false);
    setFormData({
      name: '',
      email: '',
      message: ''
    });
  };

  return (
    <div>
      <Card>
        <CardContent>
          <div>
            <Mail />
          </div>
        </CardContent>
      </Card>

      <div>
        <DialogFooter>
        </DialogFooter>
      </div>
    </div>
  );
};

export default GemachDetail;
