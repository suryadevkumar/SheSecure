import { useState, useEffect } from 'react';
import { sendLink } from '../routes/sosSystem-routes';
import { FaWhatsapp, FaTimes, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { getEmergencyContacts } from '../routes/emergency-contact-routes';

const ContactSelector = ({ location_id, onComplete, requireSelection }) => {
  const [contacts, setContacts] = useState([]);
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState(null);

  const token= useSelector((state)=>state.auth.token);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const result = await getEmergencyContacts(token);
        if (result.success && result.contacts?.length) {
          setContacts(result.contacts);
        } else {
          setError('No emergency contacts found');
        }
      } catch (err) {
        setError('Failed to load contacts');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [token]);

  const toggleContact = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId) 
        : [...prev, contactId]
    );
  };

  const handleSend = async () => {
    if (requireSelection && selectedContacts.length === 0) {
      setError('Please select at least one contact');
      return;
    }

    setIsSending(true);
    setError(null);

    try {
      if (selectedContacts.length > 0) {
        const contactsToSend = contacts.filter(c => selectedContacts.includes(c._id));
        const contactNumbers = contactsToSend.map(c => c.contactNumber);
        sendLink(contactNumbers, "Live_Location", location_id, token);
      }
      
      onComplete(true);
    } catch (err) {
      setError('Failed to send messages. Please try again.');
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancel = () => {
    onComplete(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2">Loading contacts...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Share Location with Contacts</h3>
        <button onClick={handleCancel} className="text-gray-500 hover:text-gray-700 cursor-pointer">
          <FaTimes />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 flex items-start gap-2">
          <FaExclamationTriangle className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Select contacts to share your live location:</p>
        <div className="max-h-64 overflow-y-auto border rounded-lg">
          {contacts.length > 0 ? (
            contacts.map(contact => (
              <div 
                key={contact._id} 
                className={`p-3 border-b flex items-center cursor-pointer hover:bg-gray-50 ${
                  selectedContacts.includes(contact._id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => toggleContact(contact._id)}
              >
                <input
                  type="checkbox"
                  checked={selectedContacts.includes(contact._id)}
                  onChange={() => {}}
                  className="mr-3 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-medium">{contact.name}</p>
                  <p className="text-sm text-gray-500">{contact.contactNumber}</p>
                </div>
                <FaWhatsapp className="text-green-500 ml-2" />
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No emergency contacts found
            </div>
          )}
        </div>
      </div>
      
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleSend}
          disabled={isSending || (requireSelection && selectedContacts.length === 0)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
            isSending || (requireSelection && selectedContacts.length === 0)
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
          }`}
        >
          {isSending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <FaWhatsapp />
              {selectedContacts.length > 0 ? 
                `Send to ${selectedContacts.length} contact${selectedContacts.length !== 1 ? 's' : ''}` : 
                'Skip Sharing'}
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ContactSelector;