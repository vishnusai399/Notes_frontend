import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editNoteText, setEditNoteText] = useState('');

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/notes');
        setNotes(response.data);
      } catch (error) {
        console.error('Error fetching notes:', error);
      }
    };

    fetchNotes();
  }, []);

  const handleInputChange = (e) => {
    setNewNote(e.target.value);
  };

  const handleAddNote = async () => {
    try {
      if (newNote.trim() !== '') {
        const response = await axios.post('http://localhost:5000/api/notes', { text: newNote });
        setNotes([...notes, response.data]);
        setNewNote('');
      }
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  const handleDeleteNote = async (index) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${notes[index]._id}`);
      const newNotes = [...notes];
      newNotes.splice(index, 1);
      setNotes(newNotes);
      if (editingIndex === index) {
        setEditingIndex(null);
        setEditNoteText('');
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
  };

  const handleEditNote = (index) => {
    setEditingIndex(index);
    setEditNoteText(notes[index].text);
  };

  const handleUpdateNote = async (index) => {
    try {
      await axios.put(`http://localhost:5000/api/notes/${notes[index]._id}`, { text: editNoteText });
      const updatedNotes = [...notes];
      updatedNotes[index].text = editNoteText;
      setNotes(updatedNotes);
      setEditingIndex(null);
      setEditNoteText('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditNoteText('');
  };

  const filteredNotes =
    selectedMonth === 'all'
      ? notes
      : notes.filter((note) => new Date(note.date).getMonth() + 1 === parseInt(selectedMonth, 10));

  return (
    <div className="app">
      <h1>My Notes</h1>

      <div className="add-note">
        <input type="text" value={newNote} onChange={handleInputChange} />
        <button onClick={handleAddNote}>Add Note</button>
      </div>

      <div className="filter-notes">
        <label htmlFor="monthFilter">Filter by Month:</label>
        <select id="monthFilter" value={selectedMonth} onChange={handleMonthChange}>
          <option value="all">All</option>
          {Array.from({ length: 12 }, (_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
      </div>

      <div className="notes-list">
        {filteredNotes.map((note, index) => (
          <div key={note._id} className="note-card">
            <div className="note">
              {editingIndex === index ? (
                <input
                  type="text"
                  value={editNoteText}
                  onChange={(e) => setEditNoteText(e.target.value)}
                />
              ) : (
                <p>{note.text}</p>
              )}
              <p className="date">{new Date(note.date).toDateString()}</p>
            </div>
            <div>
              {editingIndex === index ? (
                <>
                  <button onClick={() => handleUpdateNote(index)}>Update</button>
                  <button onClick={cancelEdit}>Cancel</button>
                </>
              ) : (
                <button onClick={() => handleEditNote(index)}>Edit</button>
              )}
              <button onClick={() => handleDeleteNote(index)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;

