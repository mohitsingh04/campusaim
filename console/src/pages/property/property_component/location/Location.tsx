import { useCallback, useEffect, useState } from "react";
import AddLocationForm from "./AddLocationForm";
import { API } from "../../../../contexts/API";
import {
  CityProps,
  CountryProps,
  PropertyProps,
  StateProps,
} from "../../../../types/types";
import EditLocationForm from "./EditLocationForm";
import { getErrorResponse } from "../../../../contexts/Callbacks";

export default function Location({
  property,
  location,
  getPropertyLocation,
}: {
  property: PropertyProps | null;
  getPropertyLocation: () => void;
  location: null;
}) {
  const [countries, setCountries] = useState<CountryProps[]>([]);
  const [states, setStates] = useState<StateProps[]>([]);
  const [cities, setCities] = useState<CityProps[]>([]);
  const [filterdStates, setFilterdStates] = useState<StateProps[]>([]);
  const [filterdCities, setFilteredCites] = useState<CityProps[]>([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");

  const getLocations = useCallback(async () => {
    try {
      const [cityRes, stateRes, countryRes] = await Promise.allSettled([
        API.get("/cities"),
        API.get("/states"),
        API.get("/countries"),
      ]);

      if (cityRes.status === "fulfilled") {
        setCities(cityRes.value.data || []);
      }
      if (stateRes.status === "fulfilled") {
        setStates(stateRes.value.data || []);
      }
      if (countryRes.status === "fulfilled") {
        setCountries(countryRes.value.data || []);
      }
    } catch (error) {
      getErrorResponse(error, true);
    }
  }, []);

  useEffect(() => {
    getLocations();
  }, [getLocations]);

  useEffect(() => {
    const founds = states.filter(
      (item) => item?.country_name === selectedCountry
    );
    setFilterdStates(founds);
  }, [selectedCountry, states]);
  useEffect(() => {
    const founds = cities.filter((item) => item?.state_name === selectedState);
    setFilteredCites(founds);
  }, [selectedState, cities]);

  return (
    <div>
      {location ? (
        <EditLocationForm
          location={location}
          cities={filterdCities}
          states={filterdStates}
          countries={countries}
          getPropertyLocation={getPropertyLocation}
          setSelectedCountry={setSelectedCountry}
          setSelectedState={setSelectedState}
        />
      ) : (
        <AddLocationForm
          onSubmit={getPropertyLocation}
          property={property}
          countries={countries}
          states={filterdStates}
          cities={filterdCities}
          setSelectedCountry={setSelectedCountry}
          setSelectedState={setSelectedState}
        />
      )}
    </div>
  );
}
