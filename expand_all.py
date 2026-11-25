import json
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('src/data/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Helper function to create question dict
def make_q(q_text, opts, correct_idx, diff, expl):
    return {
        "question": q_text,
        "options": opts,
        "correct": correct_idx,
        "difficulty": diff,
        "explanation": expl
    }

# New questions bank per category for Level 1 (15 new), Level 2 (10 new), Level 3 (15 new)
# Ensuring Level 3 are truly hard (specific facts, dates, causes, comparisons, plausible distractors).

new_questions_bank = {
    "geografia": {
        1: [
            ("¿Cuál es la capital de Italia?", ["Milán", "Roma", "Nápoles", "Florencia"], 1, "Roma es la capital y ciudad más poblada de Italia."),
            ("¿En qué país se encuentra la Torre Eiffel?", ["España", "Francia", "Italia", "Alemania"], 1, "La Torre Eiffel está ubicada en París, capital de Francia."),
            ("¿Cuál es el país más pequeño del mundo?", ["Mónaco", "San Marino", "Liechtenstein", "Ciudad del Vaticano"], 3, "La Ciudad del Vaticano es el estado soberano independiente más pequeño del mundo."),
            ("¿Qué río cruza la ciudad de Londres?", ["Sena", "Támesis", "Rin", "Danubio"], 1, "El río Támesis fluye a través de Londres y el sur de Inglaterra."),
            ("¿Cuál es la capital de Brasil?", ["Río de Janeiro", "São Paulo", "Brasilia", "Salvador de Bahía"], 2, "Brasilia fue inaugurada como capital de Brasil en 1960, reemplazando a Río de Janeiro."),
            ("¿En qué continente se encuentra el desierto del Sahara?", ["Asia", "América", "África", "Oceanía"], 2, "El Sahara es el desierto cálido más grande del mundo y se ubica en el norte de África."),
            ("¿Cuál es la capital de México?", ["Guadalajara", "Monterrey", "Ciudad de México", "Puebla"], 2, "Ciudad de México es la capital y el centro político y cultural del país."),
            ("¿Qué país comparte frontera con España al oeste?", ["Francia", "Portugal", "Andorra", "Marruecos"], 1, "Portugal limita con España por el oeste en la península ibérica."),
            ("¿Cuál es la montaña más alta de América del Sur?", ["Aconcagua", "Ojos del Salado", "Huascarán", "Monte Pissis"], 0, "El Aconcagua, con 6,961 metros, es el pico más alto de los Andes y de todo el continente americano."),
            ("¿Cuál es el país con mayor extensión territorial de África?", ["Sudáfrica", "Egipto", "Argelia", "Nigeria"], 2, "Argelia es el país más grande de África en términos de superficie terrestre."),
            ("¿En qué mar desemboca el río Danubio?", ["Mar Mediterráneo", "Mar Negro", "Mar Báltico", "Mar del Norte"], 1, "El Danubio desemboca en el Mar Negro formando un extenso delta."),
            ("¿Cuál es la capital de Colombia?", ["Medellín", "Cali", "Bogotá", "Cartagena"], 2, "Bogotá es la capital de Colombia, situada en la cordillera de los Andes."),
            ("¿Qué estrecho separa Asia de América en su punto más cercano?", ["Estrecho de Gibraltar", "Estrecho de Bering", "Estrecho de Magallanes", "Estrecho de Ormuz"], 1, "El estrecho de Bering separa Siberia (Rusia) de Alaska (EE. UU.)."),
            ("¿Cuál es la capital de Perú?", ["Cusco", "Arequipa", "Lima", "Trujillo"], 2, "Lima es la capital y la ciudad más poblada del Perú."),
            ("¿En qué isla del Caribe se encuentra la República Dominicana?", ["Cuba", "La Española", "Puerto Rico", "Jamaica"], 1, "La República Dominicana ocupa los dos tercios orientales de la isla de La Española.")
        ],
        2: [
            ("¿Cuál es la capital de Kazajistán?", ["Almaty", "Astaná", "Taskent", "Biskek"], 1, "Astaná es la capital de Kazajistán (renombrada temporalmente como Nursultán y nuevamente Astaná)."),
            ("¿Cuál es el punto más bajo de la superficie terrestre emergida?", ["Mar Muerto", "Depresión de Turfan", "Valle de la Muerte", "Lago Assal"], 0, "Las costas del Mar Muerto se encuentran a más de 430 metros bajo el nivel del mar."),
            ("¿Qué país europeo tiene forma de herradura y es conocido por sus fiordos?", ["Suecia", "Noruega", "Finlandia", "Dinamarca"], 1, "Noruega es mundialmente famosa por sus profundos fiordos glaciares en la costa atlántica."),
            ("¿Cuál es la cascada ininterrumpida más alta del mundo?", ["Salto Ángel", "Cataratas del Iguazú", "Cataratas del Niágara", "Salto Tuguela"], 0, "El Salto Ángel en Venezuela tiene una caída ininterrumpida de 807 metros."),
            ("¿En qué archipiélago se encuentra la isla de Tenerife?", ["Islas Azores", "Islas Baleares", "Islas Canarias", "Madeira"], 2, "Tenerife es la isla más grande del archipiélago español de las Islas Canarias."),
            ("¿Cuál es el desierto de altura más árido del mundo?", ["Desierto de Gobi", "Desierto de Atacama", "Desierto de Mojave", "Desierto de Karakum"], 1, "El desierto de Atacama, en Chile, es considerado el desierto no polar más árido del planeta."),
            ("¿Qué país atraviesa el ecuador y el meridiano de Greenwich?", ["Ecuador", "Ghana", "Kenia", "Ninguno", "Ninguno cruza ambos en tierra firme"], 3, "El meridiano de Greenwich cruza el ecuador en el Océano Atlántico (Golfo de Guinea), por lo que ningún país terrestre contiene la intersección exacta de ambos."),
            ("¿Cuál es la capital de Mongolia?", ["Ulán Bator", "Biskek", "Taskent", "Asjabad"], 0, "Ulán Bator es la capital y el centro cultural de Mongolia."),
            ("¿Qué canal artificial conecta el Mar Mediterráneo con el Mar Rojo?", ["Canal de Panamá", "Canal de Suez", "Canal de Corinto", "Canal de Kiel"], 1, "El Canal de Suez, inaugurado en 1869, une el Mediterráneo con el Mar Rojo a través del istmo de Suez."),
            ("¿Cuál es el país sin salida al mar más grande del mundo?", ["Suiza", "Mongolia", "Kazajistán", "Paraguay"], 2, "Kazajistán es el estado soberano sin litoral marítimo más extenso del planeta.")
        ],
        3: [
            ("¿Cuál es la profundidad exacta aproximada de la Fosa de las Marianas (Abismo Challenger)?", ["8,848 metros", "10,911 metros", "11,034 metros", "9,500 metros"], 1, "El Abismo Challenger en la Fosa de las Marianas alcanza aproximadamente 10,911 metros bajo el nivel del mar."),
            ("¿Qué cordillera asiática es conocida como 'el techo del mundo' por albergar nudos orográficos como el Pamir y el Karakórum?", ["Los Zagros", "El Cáucaso", "El Hindú Kush", "El sistema Pamir-Karakórum-Himalaya"], 3, "El conjunto formado por el Pamir, Karakórum e Himalaya converge en el Nudo de Pamir, conocido históricamente como el techo del mundo."),
            ("¿En qué año se firmó el Tratado Antártico que destina el continente exclusivamente a fines pacíficos y científicos?", ["1945", "1959", "1969", "1982"], 1, "El Tratado Antártico fue firmado en Washington D. C. el 1 de diciembre de 1959 y entró en vigor en 1961."),
            ("¿Cuál es la península más grande del mundo por superficie?", ["Península de Indostán", "Península Arábiga", "Península del Labrador", "Península de Escandinavia"], 1, "La Península Arábiga abarca aproximadamente 3.2 millones de kilómetros cuadrados."),
            ("¿Qué río europeo atraviesa o toca más capitales nacionales?", ["El Rin", "El Danubio", "El Volga", "El Sena"], 1, "El Danubio pasa por cuatro capitales europeas: Viena, Bratislava, Budapest y Belgrado."),
            ("¿Cuál es el lago tectónico de agua dulce más antiguo y profundo del mundo ubicado en Siberia?", ["Lago Baikal", "Lago Titicaca", "Lago Superior", "Lago Tanganica"], 0, "El Lago Baikal contiene el 20% del agua dulce no congelada del planeta y tiene más de 25 millones de años de antigüedad."),
            ("¿Qué corriente marina fría recorre la costa occidental de América del Sur influyendo en la aridez de Atacama?", ["Corriente del Golfo", "Corriente de Humboldt", "Corriente de Benguela", "Corriente de Kuroshio"], 1, "La corriente de Humboldt (o Peruana) transporta aguas frías desde la Antártida hacia el norte a lo largo de la costa sudamericana."),
            ("¿Cuál es el punto geográfico terrestre más alejado de cualquier océano (polo de inaccesibilidad euroasiático)?", ["Desierto de Gobi", "Siberia central (Xinjiang)", "Meseta del Tíbet", "Desierto de Taklamakán"], 1, "El polo de inaccesibilidad euroasiático se encuentra en el noroeste de China (Sinkiang), a más de 2,500 km del mar más cercano."),
            ("¿Qué país africano cambió formalmente su nombre internacional a Eswatini en 2018?", ["Lesoto", "Suazilandia", "Botsuana", "Namibia"], 1, "Suazilandia fue rebautizada oficialmente como Reino de Eswatini por su monarca en 2018."),
            ("¿Cuál es el único estado de EE. UU. situado completamente fuera de Norteamérica y que no es una isla oceánica volcánica exclusivamente insular?", ["Alaska", "Hawái", "Puerto Rico", "Guam"], 0, "Alaska se encuentra en el extremo noroeste del continente norteamericano, separada por Canadá."),
            ("¿Qué estrecho marítimo separa la isla de Tierra del Fuego del continente americano en el extremo austral?", ["Estrecho de Davis", "Estrecho de Magallanes", "Pasaje de Drake", "Canal Beagle"], 1, "El estrecho de Magallanes es un paso navegable entre el océano Atlántico y el Pacífico en el extremo sur de Sudamérica."),
            ("¿Cuál es la meseta volcánica basáltica más grande de la India formada hace unos 66 millones de años?", ["Meseta de Decán (Traps del Decán)", "Meseta de Chota Nagpur", "Meseta de Malwa", "Meseta de Karnataka"], 0, "Los Traps del Decán son una vasta provincia ígnea formada por masivas inundaciones basálticas sincrónicas con el evento de extinción masiva del Cretácico-Paleógeno."),
            ("¿Qué mar interior sin salida al mar está rodeado por Rusia, Irán, Azerbaiyán, Turkmenistán y Kazajistán?", ["Mar Negro", "Mar Caspio", "Mar Aral", "Mar Rojo"], 1, "El Mar Caspio es técnicamente el lago salado más grande del mundo, históricamente considerado un mar interior."),
            ("¿Cuál es el archipiélago volcánico en el Atlántico Norte propiedad de Portugal, situado a unos 1,500 km de Lisboa?", ["Islas Canarias", "Archipiélago de las Azores", "Islas Salvajes", "Cabo Verde"], 1, "Las Azores son un grupo de nueve islas volcánicas portuguesas en medio del Atlántico Norte."),
            ("¿Qué país posee la mayor cantidad de husos horarios (zonas horarias) debido a sus territorios de ultramar?", ["Rusia", "Estados Unidos", "Francia", "Reino Unido"], 2, "Francia posee 12 zonas horarias diferentes gracias a sus departamentos y territorios de ultramar repartidos por todo el globo.")
        ]
    }
}

print("Expansion script template ready.")
