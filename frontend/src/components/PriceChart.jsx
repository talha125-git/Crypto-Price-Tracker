const PriceCard = ({ name, price }) => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-2xl shadow-lg w-full">
      <h2 className="text-xl font-semibold">{name}</h2>
      <p className="text-2xl mt-2 text-blue-400">
        {price === "Loading..." ? price : `$${price}`}
      </p>
    </div>
  );
};

export default PriceCard;
