type BookingSummaryProps = { service: string; price: string; unit: string; dateLabel?: string; nightsLabel?: string };

export default function BookingSummary({ service, price, unit, dateLabel = "Oct 12 - Oct 15", nightsLabel = "3 Nights Total" }: BookingSummaryProps) {
  return (
    <aside className="hidden self-start rounded-[13px] bg-white p-3 shadow-[0_3px_18px_rgba(68,38,39,.05)] md:block">
      <h2 className="mb-[15px] mt-1 text-[11px] font-bold">Booking Summary</h2>
      {[["⌂", "SERVICE", service, `Rs. ${price} ${unit}`, "bg-[#ffe3df] text-[#A13D3F]"], ["♥", "PET", "Charlie", "Golden Retriever", "bg-[#fce9e9] text-[#A13D3F]"], ["▣", "DATES", dateLabel, nightsLabel, "bg-[#d9f5e8] text-[#168866]"]].map(([icon, label, value, detail, colour]) => <div key={label} className="mb-3 flex gap-2"><span className={`grid h-[27px] w-[27px] shrink-0 place-items-center rounded-[9px] text-[14px] ${colour}`}>{icon}</span><p className="m-0"><small className="block text-[6px] text-[#887d7e]">{label}</small><b className="my-0.5 block text-[8px]">{value}</b><em className="block text-[6px] not-italic text-[#74696a]">{detail}</em></p></div>)}
      <div className="mb-3 mt-4 border-t border-[#f0e3e1] pt-[11px] text-[7px] text-[#736767]"><p className="mb-[7px] flex justify-between"><span>Subtotal (3 nights)</span><b className="text-[#564a4a]">Rs. 25,500.00</b></p><p className="mb-[7px] flex justify-between"><span>Service Fee</span><b className="text-[#564a4a]">Rs. 1,500.00</b></p><p className="mt-2.5 flex justify-between border-t border-[#f0e3e1] pt-[9px] text-[10px] font-bold text-[#A13D3F]"><span>Total</span><b>Rs. 27,000.00</b></p></div>
      <div className="rounded-[8px] border border-[#bce7d7] bg-[#e9f9f3] p-2.5 text-[7px] text-[#14765a]"><b className="block">♧ Premium Coverage</b><span className="mt-[5px] block font-bold">Included</span><p className="mb-0 mt-0.5 leading-[1.25]">Includes 24/7 vet support and comprehensive insurance.</p></div>
      <button type="button" className="mt-3 w-full rounded-[8px] bg-[#A13D3F] p-[11px] text-[9px] font-bold text-white shadow-[0_5px_10px_rgba(161,61,63,.17)]">Confirm Booking <span className="float-right text-[14px] leading-[7px]">›</span></button>
    </aside>
  );
}
