import { useState, useEffect, useCallback } from "react";
import PropertyRanksView from "./PropertyRanksView";
import PropertyRanksEdit from "./PropertyRanksEdit";
import { API } from "../../../../contexts/API";
import { getErrorResponse } from "../../../../contexts/Callbacks";
import { PropertyProps } from "../../../../types/types";

export interface RankItem {
  rank_name: string;
  value_name: string;
}

interface PropertyRanksProps {
  property: PropertyProps | null;
}

export default function PropertyRanks({ property }: PropertyRanksProps) {
  const [ranks, setRanks] = useState<RankItem[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const getRanks = useCallback(async () => {
    if (!property?._id) return;
    setLoading(true);
    try {
      const response = await API.get(`/property/ranking/${property._id}`);
      setRanks(response.data?.ranks || []);
    } catch (error) {
      getErrorResponse(error, true);
    } finally {
      setLoading(false);
    }
  }, [property?._id]);

  useEffect(() => {
    getRanks();
  }, [getRanks]);

  if (!property) return null;
  if (loading && ranks.length === 0)
    return <div className="p-6 text-center opacity-50">Loading ranks...</div>;

  return (
    <div className="w-full">
      {isEditing ? (
        <PropertyRanksEdit
          propertyId={property._id}
          initialRanks={ranks}
          onCancel={() => setIsEditing(false)}
          onSuccess={() => {
            setIsEditing(false);
            getRanks();
          }}
        />
      ) : (
        <PropertyRanksView ranks={ranks} onEdit={() => setIsEditing(true)} />
      )}
    </div>
  );
}
