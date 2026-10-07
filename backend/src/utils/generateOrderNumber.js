export const generateOrderNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase().slice(0, 6);
  const random = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${timestamp}${random}`;
};

export default generateOrderNumber;
