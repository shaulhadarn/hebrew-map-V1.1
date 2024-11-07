import { useState } from 'react';
import { PolygonData } from '../types/polygon';
import { Search, SortDesc, MapPin, Calendar, Trash2, ChevronDown, Plane } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { formatDistanceToNow } from 'date-fns';
import { he } from 'date-fns/locale';

interface SavedPolygonsPanelProps {
  polygons: PolygonData[];
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const SavedPolygonsPanel = ({
  polygons,
  onClose,
  onDelete,
}: SavedPolygonsPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'area' | 'price'>('date');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (type: 'date' | 'area' | 'price') => {
    setSortBy(type);
  };

  const handleSendToDrone = (polygon: PolygonData) => {
    alert('נשלח לחברת הרחפנים בהצלחה!');
  };

  const filteredAndSortedPolygons = polygons
    .filter((polygon) =>
      polygon.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'area':
          return b.area - a.area;
        case 'price':
          return b.estimatedPrice - a.estimatedPrice;
        default:
          return 0;
      }
    });

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="absolute top-0 left-0 h-full w-96 bg-white shadow-lg z-[1000] font-rubik overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">פוליגונים שמורים</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="חיפוש לפי שם..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-10 text-right"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            <Button
              variant={sortBy === 'date' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleSort('date')}
              className="whitespace-nowrap"
            >
              <Calendar className="h-4 w-4 ml-2" />
              תאריך
            </Button>
            <Button
              variant={sortBy === 'area' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleSort('area')}
              className="whitespace-nowrap"
            >
              <MapPin className="h-4 w-4 ml-2" />
              שטח
            </Button>
            <Button
              variant={sortBy === 'price' ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => handleSort('price')}
              className="whitespace-nowrap"
            >
              <SortDesc className="h-4 w-4 ml-2" />
              מחיר
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredAndSortedPolygons.length === 0 ? (
          <p className="text-gray-500 text-center mt-8">
            {searchTerm ? 'לא נמצאו תוצאות' : 'אין פוליגונים שמורים עדיין'}
          </p>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedPolygons.map((polygon) => (
              <div
                key={polygon.id}
                className="border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleExpand(polygon.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <ChevronDown
                      className={`h-5 w-5 transform transition-transform ${
                        expandedId === polygon.id ? 'rotate-180' : ''
                      }`}
                    />
                    <h3 className="font-medium text-right">{polygon.name}</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 text-right">
                    <p>שטח: {polygon.area.toFixed(2)} מ"ר</p>
                    <p>מחיר: ₪{polygon.estimatedPrice.toLocaleString()}</p>
                  </div>
                </div>

                {expandedId === polygon.id && (
                  <div className="px-4 pb-4 border-t pt-4 bg-gray-50">
                    <div className="text-sm text-right">
                      <p className="text-gray-600 mb-3">
                        נוצר לפני:{' '}
                        {formatDistanceToNow(new Date(polygon.createdAt), {
                          addSuffix: true,
                          locale: he,
                        })}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSendToDrone(polygon)}
                          className="flex items-center justify-center"
                        >
                          <Plane className="h-4 w-4 ml-1" />
                          שלח
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            alert('צפייה במפה - יתווסף בקרוב');
                          }}
                          className="flex items-center justify-center"
                        >
                          <MapPin className="h-4 w-4 ml-1" />
                          צפה
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => onDelete(polygon.id)}
                          className="flex items-center justify-center"
                        >
                          <Trash2 className="h-4 w-4 ml-1" />
                          מחק
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};