const calculatePercentageDiscount = (amount, discountPercentage) => {
  const discountedAmount = (amount * discountPercentage) / 100;
  return Math.floor(discountedAmount / 100) * 100;
};

module.exports = calculatePercentageDiscount;
