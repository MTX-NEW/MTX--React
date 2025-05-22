import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { format, parseISO } from 'date-fns';
import { timeSheetApi } from '@/api/baseApi';
import { toast } from 'react-toastify';

const EditShift = ({ timesheet, isOpen, onClose, onSuccess }) => {
  const [clockIn, setClockIn] = useState(
    timesheet?.clock_in ? format(parseISO(timesheet.clock_in), "HH:mm") : ""
  );
  const [clockOut, setClockOut] = useState(
    timesheet?.clock_out ? format(parseISO(timesheet.clock_out), "HH:mm") : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!timesheet) {
        toast.error("No timesheet selected for editing");
        return;
      }

      // Format date part from the original date
      const datePart = timesheet.date.split('T')[0];
      
      // Combine date with new time values
      const newClockIn = clockIn ? `${datePart}T${clockIn}:00` : null;
      const newClockOut = clockOut ? `${datePart}T${clockOut}:00` : null;

      // Validate times
      if (newClockIn && newClockOut && new Date(newClockIn) >= new Date(newClockOut)) {
        toast.error("Clock out time must be after clock in time");
        setIsSubmitting(false);
        return;
      }

      // Update the timesheet
      await timeSheetApi.update(timesheet.timesheet_id, {
        clock_in: newClockIn,
        clock_out: newClockOut
      });

      toast.success("Shift updated successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating shift:", error);
      toast.error("Failed to update shift");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit Shift</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="text"
              value={timesheet?.date ? format(parseISO(timesheet.date), "MM/dd/yyyy") : ""}
              disabled
            />
            <Form.Text className="text-muted">
              Date cannot be changed. Create a new entry if needed.
            </Form.Text>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Clock In Time</Form.Label>
            <Form.Control
              type="time"
              value={clockIn}
              onChange={(e) => setClockIn(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Clock Out Time</Form.Label>
            <Form.Control
              type="time"
              value={clockOut}
              onChange={(e) => setClockOut(e.target.value)}
              required={timesheet?.clock_out !== null}
            />
            <Form.Text className="text-muted">
              Leave empty if shift is still active
            </Form.Text>
          </Form.Group>

          <div className="d-flex justify-content-end mt-4">
            <Button variant="secondary" onClick={onClose} className="me-2">
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              disabled={isSubmitting}
            >
              Save Changes
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditShift; 