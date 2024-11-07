import { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface SearchLocationProps {
  onLocationSelect: (lat: number, lon: number) => void;
}

export const SearchLocation = ({ onLocationSelect }: SearchLocationProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const searchLocation = async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&countrycodes=il`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error searching location:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (result: SearchResult) => {
    onLocationSelect(parseFloat(result.lat), parseFloat(result.lon));
    setResults([]);
    setQuery('');
    setIsExpanded(false);
  };

  const handleClose = () => {
    setIsExpanded(false);
    setQuery('');
    setResults([]);
  };

  if (!isExpanded) {
    return (
      <div className="absolute top-20 right-4 z-[1000]">
        <Button
          onClick={() => setIsExpanded(true)}
          variant="secondary"
          size="icon"
          className="bg-white shadow-md hover:bg-gray-50"
        >
          <Search className="h-4 w-4 text-gray-700" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-4 z-[1000] w-80 font-rubik">
      <div className="bg-white rounded-lg shadow-lg p-2">
        <div className="flex gap-2">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="חפש מיקום..."
            className="text-right"
            onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
            autoFocus
          />
          <Button
            onClick={searchLocation}
            disabled={isSearching}
            size="icon"
            variant="secondary"
          >
            <Search className="h-4 w-4 text-gray-700" />
          </Button>
          <Button
            onClick={handleClose}
            size="icon"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {results.length > 0 && (
          <div className="mt-2 bg-white rounded-lg border max-h-60 overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={index}
                className="w-full text-right px-4 py-2 hover:bg-gray-100 border-b last:border-b-0"
                onClick={() => handleSelect(result)}
              >
                <p className="text-sm truncate">{result.display_name}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};