import axios from 'axios';

const API_URL = `${import.meta.env.VITE_TM_API_URL}/api/`;

export const createNote = async (outreachId, noteData) => {
  try {
    const formData = new FormData();
    
    // Add the contact methods as a JSON string
    formData.append('contactMethod', JSON.stringify(noteData.options));
    formData.append('message', noteData.message);
    formData.append('reminderDate', noteData.reminder.toISOString());
    
    // Add file if it exists
    if (noteData.attachment) {
      formData.append('attachment', noteData.attachment[0].originFileObj);
    }

    const response = await axios.post(
      `${API_URL}/outreach/${outreachId}/notes`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getNotesByOutreach = async (outreachId) => {
  try {
    const response = await axios.get(`${API_URL}/outreach/${outreachId}/notes`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getNoteById = async (noteId) => {
  try {
    const response = await axios.get(`${API_URL}/notes/${noteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const updateNote = async (noteId, noteData) => {
  try {
    const formData = new FormData();
    console.log(noteData,"ketul")
    // Add the contact methods as a JSON string
    formData.append('contactMethod', JSON.stringify(noteData.options));
    formData.append('message', noteData.message);
    formData.append('reminderDate', noteData.reminder.toISOString());
    
    // Add new file if it exists
    if (noteData.attachment && noteData.attachment.length > 0 && noteData.attachment[0].originFileObj) {
      formData.append('attachment', noteData.attachment[0].originFileObj);
    } else if (!noteData.attachment || noteData.attachment.length === 0) {
      formData.append('removeAttachment', 'true');
    }

    const response = await axios.put(
      `${API_URL}/notes/${noteId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const deleteNote = async (noteId) => {
  try {
    const response = await axios.delete(`${API_URL}/notes/${noteId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};
