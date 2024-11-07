import { useState } from 'react';
import { PolygonData } from '../types/polygon';
import { Plane, Save, X, Ruler, CreditCard, AlertTriangle } from 'lucide-react';

interface PolygonModalProps {
  polygon: PolygonData;
  onClose: () => void;
  onSave: (polygon: PolygonData) => void;
}

export const PolygonModal = ({ polygon, onClose, onSave }: PolygonModalProps) => {
  const [name, setName] = useState(polygon.name);

  const handleSubmit = () => {
    onSave({ ...polygon, name });
  };

  const handleSendToDrone = () => {
    // In a real app, this would send the data to a drone service
    alert('נשלח לחברת הרחפנים בהצלחה!');
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content font-rubik">
        <h2 className="text-2xl font-bold mb-4">פרטי פוליגון</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">שם</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 border rounded-md"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              שטח
            </label>
            <p className="p-2 bg-gray-50 rounded-md">
              {polygon.area.toFixed(2)} מ"ר
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              מחיר משוער
            </label>
            <p className="p-2 bg-gray-50 rounded-md">
              ₪{polygon.estimatedPrice.toFixed(2)}
            </p>
          </div>

          {polygon.intersectingNoFlyZones && polygon.intersectingNoFlyZones.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <AlertTriangle className="h-5 w-5" />
                <h3 className="font-medium">התראת אזור אסור לטיסה</h3>
              </div>
              <p className="text-sm text-red-600">
                הפוליגון חופף עם אזורים אסורים לטיסה:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-red-600">
                {polygon.intersectingNoFlyZones.map((zone, index) => (
                  <li key={index}>{zone}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end space-x-4 space-x-reverse">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            ביטול
          </button>
          <button
            onClick={handleSendToDrone}
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-secondary/90 flex items-center gap-2"
            disabled={polygon.intersectingNoFlyZones && polygon.intersectingNoFlyZones.length > 0}
          >
            <Plane className="h-4 w-4" />
            שלח לחברת רחפנים
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            שמור פוליגון
          </button>
        </div>
      </div>
    </div>
  );
};