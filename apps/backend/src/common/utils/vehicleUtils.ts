export function generateVehicleName(
  categoryName: string,
  typeName: string,
  licensePlate: string,
): string {
  if (!categoryName || !typeName || !licensePlate) {
    throw new Error(
      'Category, Type, and LicensePlate are required to generate vehicle name',
    );
  }

  return `${categoryName} (${typeName}) - ${licensePlate}`;
}
