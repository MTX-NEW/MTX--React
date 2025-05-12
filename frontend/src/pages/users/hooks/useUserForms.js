import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { userValidationSchema } from '@/validations/inputValidation';
import { toast } from 'react-toastify';

export const useUserForms = ({ createUser, updateUser, refreshUsers, itemToEdit }) => {
  const addFormMethods = useForm({
    resolver: yupResolver(userValidationSchema),
    mode: "onChange",
  });

  const editFormMethods = useForm({
    resolver: yupResolver(userValidationSchema),
    mode: "onChange",
  });

  const handleAddSubmit = async (data) => {
    try {
      await createUser(data);
      await refreshUsers();
      addFormMethods.reset();
      toast.success(`User ${data.first_name} added!`);
      return true;
    } catch (error) {
      toast.error("Failed to add user");
      console.error("Error adding user:", error);
      return false;
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateUser(itemToEdit.id, data);
      await refreshUsers();
      toast.success(`User ${data.first_name} updated!`);
      return true;
    } catch (error) {
      toast.error("Failed to update user");
      console.error("Error updating user:", error);
      return false;
    }
  };

  return {
    addFormMethods,
    editFormMethods,
    handleAddSubmit,
    handleEditSubmit
  };
}; 