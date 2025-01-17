import { OXYGEN_INVENTORY } from "./constants";

export const getNDateBefore = (d, n) => {
  const dt = new Date(d);
  return new Date(dt.setDate(dt.getDate() - n));
};

export const getNDateAfter = (d, n) => {
  const dt = new Date(d);
  return new Date(dt.setDate(dt.getDate() + n));
};

export const dateString = (d) => {
  return `${d.getFullYear()}-${`0${d.getMonth() + 1}`.slice(
    -2
  )}-${`0${d.getDate()}`.slice(-2)}`;
};

const timeToEmpty = (inventoryItem) =>
  inventoryItem &&
  inventoryItem.stock &&
  inventoryItem.burn_rate &&
  inventoryItem.burn_rate !== undefined &&
  Math.round(inventoryItem.burn_rate ?? 0) !== 0
    ? (inventoryItem?.stock / inventoryItem?.burn_rate).toFixed(2)
    : -1;

export const processFacilities = (data, filterFacilityTypes, orderBy) => {
  return data
    .filter((d) => d.facility)
    .map(({ data, created_date, facility, modified_date }) => ({
      date: dateString(new Date(created_date)),

      id: facility.id,
      name: facility.name,
      address: facility.address,
      districtId: facility.district,
      facilityType: facility.facility_type || "Unknown",
      location: facility.location,
      phoneNumber: facility.phone_number,
      inventory: data.inventory,

      modifiedDate:
        data.availability && data.availability.length !== 0
          ? Math.max(...data.availability.map((a) => new Date(a.modified_date)))
          : data.modified_date || modified_date,
      inventoryModifiedDate:
        data.inventory && Object.keys(data.inventory).length !== 0
          ? Math.max(
              ...Object.values(data.inventory).map(
                (a) => new Date(a.modified_date)
              )
            )
          : data.modified_date || modified_date,

      ...("availability" in data
        ? {
            capacity: data.availability
              ? data.availability.reduce((cAcc, cCur) => {
                  return {
                    ...cAcc,
                    [cCur.room_type]: cCur,
                  };
                }, {})
              : null,
            oxygenCapacity: data.oxygen_capacity,
            type_b_cylinders: data.type_b_cylinders,
            type_c_cylinders: data.type_c_cylinders,
            type_d_cylinders: data.type_d_cylinders,
            expected_oxygen_requirement: data.expected_oxygen_requirement,
            expected_type_b_cylinders: data.expected_type_b_cylinders,
            expected_type_c_cylinders: data.expected_type_c_cylinders,
            expected_type_d_cylinders: data.expected_type_d_cylinders,
            actualDischargedPatients: data.actual_discharged_patients,
            actualLivePatients: data.actual_live_patients,
            tte_tank: Number(
              timeToEmpty(
                data.inventory && data.inventory[OXYGEN_INVENTORY.liquid]
              ) || -1
            ),
            tte_d_cylinders: Number(
              timeToEmpty(
                data.inventory && data.inventory[OXYGEN_INVENTORY.type_d]
              ) || -1
            ),
            tte_j_cylinders: Number(
              timeToEmpty(
                data.inventory && data.inventory[OXYGEN_INVENTORY.type_j]
              ) || -1
            ),
            tte_gaseous: Number(
              timeToEmpty(
                data.inventory && data.inventory[OXYGEN_INVENTORY.gaseous]
              ) || -1
            ),
          }
        : {
            ...data,
          }),
    }))
    .filter((f) => filterFacilityTypes.includes(f.facilityType))
    .reduce((acc, f, i, arr) => {
      const zero = acc?.zero || acc;
      const nonZero = acc?.nonZero || acc;
      let returnable;
      if (arr.length === 1) {
        return arr;
      }
      if (
        orderBy
          ? Math.round(f[orderBy.selector]) >= 0 &&
            Number(f[orderBy.selector]) < Infinity
          : true
      ) {
        returnable = { zero, nonZero: [...nonZero, f] };
      } else {
        returnable = { nonZero, zero: [...zero, f] };
      }
      if (arr.length - 1 === i) {
        return [
          ...nonZero.sort((a, b) => {
            return orderBy && a[orderBy.selector] !== undefined
              ? a[orderBy.selector] < b[orderBy.selector]
                ? 1 * Number(orderBy.order)
                : -1 * Number(orderBy.order)
              : new Date(a.modifiedDate) < new Date(b.modifiedDate)
              ? 1
              : -1;
          }),
          ...zero,
        ];
      }
      return returnable;
    }, []);
};
