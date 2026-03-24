const expressions = {
    happy: { face: '\ud83d\ude0a', color: 'bg-amber-300', text: '\u00a1Feliz y activo!' },
    neutral: { face: '\ud83d\ude10', color: 'bg-amber-200', text: 'Estado normal' },
    sleepy: { face: '\ud83d\ude34', color: 'bg-gray-300', text: 'Fase Lag' },
    sour: { face: '\ud83d\ude16', color: 'bg-yellow-400', text: 'Muy \u00e1cido' },
    dead: { face: '\ud83d\udc80', color: 'bg-red-300', text: 'Muerto' },
    young: { face: '\ud83d\ude80', color: 'bg-orange-300', text: 'Muy joven/activo' },
    old: { face: '\ud83d\udc0c', color: 'bg-blue-300', text: 'Sobrefermentado' }
};

export default function MasagochiAvatar({ state }) {
    const expr = expressions[state];
    return (
        <div className={`${expr.color} rounded-full w-28 h-28 flex flex-col items-center justify-center shadow-lg transition-all duration-500`}>
            <div className="text-5xl">{expr.face}</div>
            <div className="text-xs font-bold mt-1 text-gray-700 text-center px-2">{expr.text}</div>
        </div>
    );
}
