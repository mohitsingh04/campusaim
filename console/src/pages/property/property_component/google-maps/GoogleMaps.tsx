import React, { useState, useEffect, useCallback } from "react";
import { PropertyProps } from "../../../../types/types";
import {
  Save,
  MapPin,
  Search,
  Navigation,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { API } from "../../../../contexts/API";
import toast from "react-hot-toast";
import { getErrorResponse } from "../../../../contexts/Callbacks";

export default function GoogleMaps({
  property,
  location,
}: {
  property: PropertyProps | null;
  location: any;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  const generateEmbedUrl = (query: string) => {
    const encoded = encodeURIComponent(query || "World Map");
    return `https://maps.google.com/maps?q=${encoded}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  };

  const fetchSavedMap = useCallback(async () => {
    if (!property?._id) return;
    setIsLoading(true);
    try {
      const response = await API.get(`/property/maps/${property._id}`);
      const savedData = response.data?.mapUrl;
      if (savedData && savedData.includes("http")) {
        setMapUrl(savedData);
      } else {
        const initialQuery = property?.property_name || "";
        setMapUrl(generateEmbedUrl(initialQuery));
      }
    } catch (error) {
      getErrorResponse(error, true);
      const fallback = property?.property_name || "";
      setMapUrl(generateEmbedUrl(fallback));
    } finally {
      setIsLoading(false);
    }
  }, [property]);

  useEffect(() => {
    fetchSavedMap();
  }, [fetchSavedMap]);

  const suggestions = [
    property?.property_name,
    location?.property_city
      ? `${property?.property_name}, ${location.property_city}`
      : null,
    location?.property_state
      ? `${property?.property_name}, ${location.property_state}`
      : null,
  ].filter(Boolean) as string[];

  const handleSearch = (e?: React.FormEvent, customQuery?: string) => {
    e?.preventDefault();
    const query = customQuery || searchQuery;
    if (query.trim()) {
      setMapUrl(generateEmbedUrl(query));
      setDisplayName(query);
      setSaved(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!mapUrl) return;
    setIsSaving(true);
    try {
      const response = await API.post("/property/maps/create", {
        property_id: property?._id,
        mapUrl: mapUrl,
      });
      toast.success(response.data.message || "Map location saved!");
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      getErrorResponse(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex w-full bg-[var(--yp-primary-bg)] overflow-hidden font-sans">
      <div className="w-96 h-full flex flex-col bg-[var(--yp-secondary-bg)] border-r border-[var(--yp-border-primary)] shadow-2xl z-20">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-[var(--yp-main)]">
              <Navigation size={18} fill="currentColor" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Map Engine
              </span>
            </div>
            {isLoading && (
              <RefreshCw
                size={14}
                className="animate-spin text-[var(--yp-text-secondary)]"
              />
            )}
          </div>
          <h2 className="text-2xl font-black text-[var(--yp-text-primary)] tracking-tight italic">
            {property?.property_name || "Explore"}
          </h2>
        </div>

        <div className="px-8 py-4 space-y-4">
          <form onSubmit={handleSearch} className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--yp-main)]"
              size={18}
            />
            <input
              type="text"
              className="w-full pl-11 pr-4 py-3.5 bg-[var(--yp-input-primary)] rounded-2xl focus:ring-2 focus:ring-[var(--yp-main)] shadow-sm text-[var(--yp-text-primary)] border-none transition-all"
              placeholder="Search specific landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="flex gap-2">
            <button
              onClick={() => handleSearch()}
              className="flex-1 py-3.5 bg-[var(--yp-main-subtle)] text-[var(--yp-main-emphasis)] font-bold rounded-2xl active:scale-95 transition-all shadow-md hover:opacity-80"
            >
              Preview
            </button>
            <button
              onClick={handleSaveLocation}
              disabled={isSaving || !mapUrl}
              className={`px-6 rounded-2xl transition-all flex items-center justify-center border-2 ${
                saved
                  ? "bg-[var(--yp-success-subtle)] border-[var(--yp-success-emphasis)] text-[var(--yp-success-emphasis)]"
                  : "bg-[var(--yp-main)] border-[var(--yp-main)] text-white shadow-lg"
              }`}
            >
              {isSaving ? (
                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              ) : saved ? (
                <CheckCircle2 size={20} />
              ) : (
                <Save size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-8 py-4 custom-scrollbar">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[11px] font-bold text-[var(--yp-text-secondary)] uppercase tracking-widest">
              Context
            </span>
            <div className="h-px flex-1 bg-[var(--yp-border-primary)] ml-4"></div>
          </div>

          <div className="space-y-3">
            {suggestions.map((item, index) => (
              <button
                key={index}
                onClick={() => handleSearch(undefined, item)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all group flex items-center gap-3 ${
                  displayName === item
                    ? "bg-[var(--yp-main-subtle)] border-[var(--yp-main)] text-[var(--yp-main-emphasis)]"
                    : "bg-[var(--yp-secondary-bg)] border-[var(--yp-border-primary)] text-[var(--yp-text-secondary)]"
                }`}
              >
                <div
                  className={`p-2 rounded-lg ${displayName === item ? "bg-[var(--yp-main)] text-white" : "bg-[var(--yp-input-primary)]"}`}
                >
                  <MapPin size={14} />
                </div>
                <span className="font-bold text-sm truncate">{item}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10">
            <RefreshCw
              className="animate-spin text-[var(--yp-main)]"
              size={32}
            />
          </div>
        )}
        <iframe
          key={mapUrl}
          title="Map"
          className="w-full h-full border-none"
          src={mapUrl}
          loading="lazy"
          allowFullScreen
        />
      </div>
    </div>
  );
}
