import { useState, useId, type FormEvent, type KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useDebounce } from '../hooks/use-debounce';
import { useCitySearch } from '../hooks/use-city-search';
import { MIN_QUERY_LENGTH } from '../lib/constants';
import type { CityCandidate } from '../types/weather';

const DEBOUNCE_DELAY_MS = 400;

interface CitySearchProps {
  onCitySelect: (city: CityCandidate) => void;
}

export function CitySearch({ onCitySelect }: CitySearchProps) {
  const [inputValue, setInputValue] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const inputId = useId();
  const listId = useId();

  const debouncedQuery = useDebounce(submittedQuery, DEBOUNCE_DELAY_MS);
  const { candidates, isLoading, isError, errorMessage } = useCitySearch(debouncedQuery);

  const showCandidates = candidates.length > 0 && debouncedQuery.length >= MIN_QUERY_LENGTH;
  const showNotFound =
    !isLoading && !isError && debouncedQuery.length >= MIN_QUERY_LENGTH && candidates.length === 0;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (trimmed.length >= MIN_QUERY_LENGTH) {
      setSubmittedQuery(trimmed);
    }
  }

  function handleSelect(city: CityCandidate) {
    setInputValue(city.name);
    setSubmittedQuery('');
    onCitySelect(city);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setSubmittedQuery('');
    }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <form onSubmit={handleSubmit} role="search" aria-label="Buscar cidade">
        <label
          htmlFor={inputId}
          className="sr-only"
        >
          cidade
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7a7a7a] pointer-events-none"
              aria-hidden="true"
            />
            <input
              id={inputId}
              role="searchbox"
              aria-label="cidade"
              aria-autocomplete="list"
              aria-controls={showCandidates ? listId : undefined}
              aria-expanded={showCandidates}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nome da cidade"
              autoComplete="off"
              className="w-full h-11 pl-10 pr-4 bg-white border border-[rgba(0,0,0,0.08)] rounded-full text-[17px] text-[#1d1d1f] placeholder:text-[#7a7a7a] focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
              style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
            />
          </div>
          <button
            type="submit"
            className="h-11 px-[22px] bg-[#0066cc] text-white rounded-full text-[17px] font-normal whitespace-nowrap active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-[#0071e3]"
            style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
          >
            Buscar
          </button>
        </div>
      </form>

      {isLoading && (
        <div className="mt-2 text-[14px] text-[#7a7a7a] text-center" aria-live="polite">
          Buscando cidades...
        </div>
      )}

      {isError && errorMessage && (
        <div role="alert" className="mt-2 text-[14px] text-red-600 text-center">
          {errorMessage}
        </div>
      )}

      {showNotFound && (
        <div
          role="status"
          aria-live="polite"
          className="mt-2 text-[14px] text-[#7a7a7a] text-center"
          style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
        >
          Cidade não encontrada. Tente outro nome.
        </div>
      )}

      {showCandidates && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Selecione a cidade"
          className="absolute z-10 mt-1 w-full bg-white border border-[#e0e0e0] rounded-[18px] shadow-md overflow-hidden"
        >
          {candidates.map((city) => (
            <li
              key={city.id}
              role="option"
              aria-selected={false}
            >
              <button
                type="button"
                onClick={() => handleSelect(city)}
                className="w-full text-left px-5 py-3 text-[17px] text-[#1d1d1f] hover:bg-[#f5f5f7] transition-colors focus:outline-none focus:bg-[#f5f5f7]"
                style={{ fontFamily: 'SF Pro Text, system-ui, -apple-system, sans-serif' }}
              >
                <span className="font-semibold">{city.name}</span>
                {city.admin1 && (
                  <span className="text-[#7a7a7a]">, {city.admin1}</span>
                )}
                <span className="text-[#7a7a7a]"> — {city.country}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
