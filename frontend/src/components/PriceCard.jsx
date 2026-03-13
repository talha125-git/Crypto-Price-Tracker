const PriceCard = ({ data, onRemove }) => {
  const { name, symbol, image, current_price, price_change_percentage_24h, quantity, totalValue } = data;

  const isPositive = price_change_percentage_24h >= 0;

  return (
    <div className="relative overflow-hidden bg-gray-900 border border-gray-800 p-6 rounded-3xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-gray-700 group">
      {/* Background Gradient Glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full opacity-20 blur-3xl ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}></div>

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-800 rounded-xl">
            <img src={image} alt={name} className="w-10 h-10 object-contain" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white leading-tight">{name}</h3>
            <span className="text-sm text-gray-400 uppercase font-medium">{symbol}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isPositive ? '▲' : '▼'} {Math.abs(price_change_percentage_24h).toFixed(2)}%
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-gray-400 text-xs uppercase tracking-wide">Current Price</p>
          <p className="text-2xl font-bold text-white">${current_price?.toLocaleString()}</p>
        </div>

        {quantity !== undefined && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-800">
            <div>
              <p className="text-gray-400 text-xs">Quantity</p>
              <p className="text-white font-medium">{quantity}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-400 text-xs">Total Value</p>
              <p className={`font-bold ${isPositive ? 'text-green-400' : 'text-white'}`}>
                ${totalValue?.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        )}
      </div>

      {onRemove && (
        <button
          onClick={() => onRemove(data.id)}
          className="absolute top-4 right-4 text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Remove from Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default PriceCard;
