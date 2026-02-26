/* --- МЕНЮ (АДАПТИРОВАННЫЙ LUXURY UI) --- */
<div style={{ 
  position: 'absolute', 
  // На мобилках кнопки снизу, на десктопе — чуть выше центра
  bottom: isMobile ? 'max(80px, 12dvh)' : '20dvh', 
  left: 0, 
  width: '100%', 
  display: 'flex', 
  flexDirection: isMobile ? 'column' : 'row', // В столбик на мобилках для удобства
  alignItems: 'center',
  justifyContent: 'center', 
  gap: isMobile ? '12px' : '30px', 
  padding: '0 20px',
  zIndex: 100,
  pointerEvents: 'all'
}}>
  {menuItems.map((item) => (
    <motion.button 
      key={item.id} 
      whileTap={{ scale: 0.95 }} 
      onClick={() => {
        setActiveTab(activeTab === item.id ? null : item.id);
        if (hapticFeedback.impactOccurred.isAvailable()) hapticFeedback.impactOccurred('medium');
      }}
      style={{ 
        width: isMobile ? '100%' : 'auto', // Кнопки на всю ширину на мобилке
        maxWidth: isMobile ? '280px' : 'none',
        background: 'rgba(255, 255, 255, 0.03)', 
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        border: '1px solid rgba(0, 242, 255, 0.2)', 
        padding: isMobile ? '18px' : '14px 24px',
        borderRadius: '16px', 
        color: activeTab === item.id ? '#00f2ff' : '#fff', 
        fontSize: '0.7rem', 
        fontWeight: '900', 
        letterSpacing: '3px', 
        cursor: 'pointer',
        boxShadow: activeTab === item.id ? '0 0 20px rgba(0,242,255,0.2)' : 'none',
        transition: 'all 0.3s ease',
        outline: 'none',
        textTransform: 'uppercase'
      }}
    >
      {item.label}
    </motion.button>
  ))}
</div>