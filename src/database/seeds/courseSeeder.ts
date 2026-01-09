import { Seeder } from "@mikro-orm/seeder";
import { EntityManager } from "@mikro-orm/mysql";
import { Course } from "../../entities/course.entity.js";
import { Topic } from "../../entities/topic.entity.js";
import { Level } from "../../entities/level.entity.js";
import { Unit } from "../../entities/unit.entity.js";

const TOPIC_DESCRIPTIONS = [
  "JavaScript",
  "Node.js",
  "SQL",
  "Frontend",
  "Backend",
];

interface UnitData {
  name: string;
  order: number;
  content: string;
}

interface LevelData {
  name: string;
  description: string;
  order: number;
  units: UnitData[];
}

interface CourseData {
  title: string;
  resume: string;
  price: number;
  topicDescriptions: string[];
  levels: LevelData[];
}

const COURSES_DATA: CourseData[] = [
  {
    title: "JavaScript desde cero",
    resume: "Sintaxis base, funciones, DOM y patrones modernos para crear interactividad.",
    price: 49.99,
    topicDescriptions: ["JavaScript", "Frontend"],
    levels: [
      {
        name: "Fundamentos",
        description: "Variables, tipos de datos, operadores y estructuras de control",
        order: 1,
        units: [
          {
            name: "Variables y tipos de datos",
            order: 1,
            content: "En JavaScript existen tres formas principales de declarar variables: var, let y const. Mientras que var tiene un scope de funcion y puede ser redeclarada, let y const introducidos en ES6 tienen scope de bloque. La palabra clave const se utiliza para declarar constantes cuyo valor no puede ser reasignado. Los tipos de datos primitivos en JavaScript incluyen: string para cadenas de texto, number para valores numericos (enteros y decimales), boolean para valores true/false, null para representar la ausencia intencional de valor, undefined para variables declaradas pero no inicializadas, y symbol para identificadores unicos. JavaScript es un lenguaje de tipado dinamico, lo que significa que las variables pueden cambiar de tipo durante la ejecucion. La conversion de tipos puede ser explicita usando funciones como String(), Number() o Boolean(), o implicita mediante coercion cuando JavaScript convierte automaticamente los tipos en operaciones mixtas.",
          },
          {
            name: "Operadores y expresiones",
            order: 2,
            content: "Los operadores aritmeticos en JavaScript incluyen suma (+), resta (-), multiplicacion (*), division (/), modulo (%), exponenciacion (**), incremento (++) y decremento (--). Los operadores de comparacion permiten comparar valores: igual (==), estrictamente igual (===), diferente (!=), estrictamente diferente (!==), mayor que (>), menor que (<), mayor o igual (>=) y menor o igual (<=). Es importante diferenciar entre == que realiza coercion de tipos y === que compara valor y tipo. Los operadores logicos AND (&&), OR (||) y NOT (!) se utilizan para combinar condiciones booleanas. El operador ternario (condicion ? valorSiTrue : valorSiFalse) ofrece una forma concisa de escribir condicionales simples. La precedencia de operadores determina el orden de evaluacion en expresiones complejas: los operadores aritmeticos se evaluan antes que los de comparacion, y estos antes que los logicos. Se pueden usar parentesis para alterar la precedencia por defecto.",
          },
          {
            name: "Estructuras de control",
            order: 3,
            content: "Las estructuras de control permiten alterar el flujo de ejecucion del programa. Las estructuras condicionales incluyen: if para ejecutar codigo cuando una condicion es verdadera, else para especificar codigo alternativo, else if para evaluar multiples condiciones secuencialmente, y switch para comparar una expresion contra multiples casos. La estructura switch es particularmente util cuando se tienen muchas condiciones basadas en el mismo valor. Los bucles permiten ejecutar codigo repetidamente: el bucle for es ideal cuando se conoce el numero de iteraciones, while ejecuta mientras una condicion sea verdadera (evaluando la condicion antes de cada iteracion), y do-while garantiza al menos una ejecucion al evaluar la condicion despues. La sentencia break permite salir prematuramente de un bucle o switch, mientras que continue salta a la siguiente iteracion del bucle sin ejecutar el codigo restante. Es fundamental evitar bucles infinitos asegurandose de que la condicion de salida eventualmente se cumpla.",
          },
        ],
      },
      {
        name: "Funciones y scope",
        description: "Funciones, arrow functions, closure y contexto de ejecucion",
        order: 2,
        units: [
          {
            name: "Declaracion de funciones",
            order: 1,
            content: "En JavaScript existen dos formas principales de crear funciones: las function declarations (declaraciones de funcion) y las function expressions (expresiones de funcion). Las function declarations se definen con la palabra clave function seguida del nombre, y son elevadas (hoisting) al inicio del contexto, lo que permite llamarlas antes de su declaracion en el codigo. Las function expressions asignan una funcion a una variable y no son elevadas. Los parametros son las variables listadas en la definicion de la funcion, mientras que los argumentos son los valores reales pasados al llamar la funcion. JavaScript permite mas o menos argumentos que parametros definidos; los parametros faltantes seran undefined y los extras pueden accederse mediante el objeto arguments o rest parameters (...args). El statement return finaliza la ejecucion de una funcion y especifica el valor a devolver; si no se especifica, la funcion retorna undefined. Las funciones anonimas son funciones sin nombre, comunmente usadas como callbacks o en expresiones de funcion. Los parametros por defecto permiten asignar valores predeterminados cuando no se pasan argumentos.",
          },
          {
            name: "Arrow functions",
            order: 2,
            content: "Las arrow functions, introducidas en ES6, ofrecen una sintaxis mas concisa para escribir funciones: (parametros) => expresion. Si hay un solo parametro, los parentesis son opcionales; si el cuerpo es una sola expresion, se puede omitir return y las llaves. La diferencia principal con las funciones tradicionales es el binding de 'this': las arrow functions no tienen su propio 'this', sino que heredan el 'this' del contexto donde fueron definidas (lexical scoping). Esto las hace ideales para callbacks y metodos dentro de objetos donde se necesita acceder al 'this' externo. Las arrow functions tampoco tienen su propio objeto arguments, ni pueden usarse como constructores con 'new'. Son particularmente utiles en operaciones con arrays como map, filter y reduce, en callbacks de eventos, y en cualquier situacion donde se requiera una funcion corta y se necesite mantener el contexto del 'this' exterior. Su sintaxis concisa mejora la legibilidad del codigo, especialmente en cadenas de operaciones funcionales.",
          },
        ],
      },
    ],
  },
  {
    title: "Node.js y Express",
    resume: "APIs REST con Express, middleware, autenticacion y despliegues básicos.",
    price: 59.99,
    topicDescriptions: ["Node.js", "Backend", "JavaScript"],
    levels: [
      {
        name: "Introduccion a Node.js",
        description: "Fundamentos de Node.js y el ecosistema npm",
        order: 1,
        units: [
          {
            name: "Que es Node.js",
            order: 1,
            content: "Node.js es un runtime de JavaScript construido sobre el motor V8 de Chrome que permite ejecutar JavaScript fuera del navegador, principalmente en el servidor. Su arquitectura esta basada en un event loop de un solo hilo que maneja operaciones I/O de forma no bloqueante, permitiendo alta concurrencia sin la necesidad de multiples hilos. Cuando se realiza una operacion asincrona (como leer un archivo o hacer una peticion de red), Node.js no espera a que termine sino que registra un callback y continua ejecutando codigo, procesando el resultado cuando este disponible. Node.js soporta dos sistemas de modulos: CommonJS (require/module.exports), el sistema tradicional, y ES Modules (import/export), el estandar moderno de JavaScript. El archivo package.json es el manifiesto del proyecto que describe dependencias, scripts, metadata y configuracion. npm (Node Package Manager) es el gestor de paquetes que permite instalar, actualizar y gestionar bibliotecas de terceros. El ecosistema npm es el mas grande de registros de software, ofreciendo millones de paquetes reutilizables que aceleran el desarrollo.",
          },
          {
            name: "Modulos core de Node",
            order: 2,
            content: "Node.js incluye modulos nativos que no requieren instalacion. El modulo 'fs' (file system) permite interactuar con el sistema de archivos: leer archivos con readFile/readFileSync, escribir con writeFile/writeFileSync, y otras operaciones como rename, unlink (eliminar), mkdir, etc. Las versiones sincronas bloquean la ejecucion, mientras que las asincronas usan callbacks o promesas. El modulo 'path' facilita el trabajo con rutas de archivos de forma independiente del sistema operativo, con metodos como join(), resolve(), basename() y dirname(). El modulo 'http' permite crear servidores y clientes HTTP: con createServer() se puede crear un servidor web basico que escucha peticiones y envia respuestas. El modulo 'events' implementa el patron Observer mediante EventEmitter, permitiendo crear y manejar eventos personalizados. Aunque se puede crear un servidor HTTP con solo el modulo nativo, frameworks como Express simplifican enormemente tareas comunes como routing, parsing de datos y manejo de middleware.",
          },
        ],
      },
      {
        name: "Express Framework",
        description: "Creacion de APIs REST con Express",
        order: 2,
        units: [
          {
            name: "Configuracion inicial",
            order: 1,
            content: "Express es el framework web mas popular para Node.js, diseñado para construir aplicaciones web y APIs de forma sencilla. Para instalarlo se usa npm install express. Una aplicacion basica requiere importar express, crear una instancia con express(), definir rutas con app.get(), app.post(), etc., y poner el servidor a escuchar en un puerto con app.listen(). El sistema de routing de Express permite mapear URLs a funciones manejadoras: app.get('/users', handler) responde a GET en /users. Los parametros de ruta se definen con dos puntos: /users/:id permite capturar valores dinamicos accesibles via req.params.id. Los query strings (?key=value&other=val) se acceden mediante req.query. Express parsea automaticamente estos valores facilitando su uso. Las rutas pueden usar wildcards y expresiones regulares para patrones mas complejos. El orden de definicion de rutas importa, ya que Express ejecuta el primer match que encuentra. Para organizar mejor el codigo, las rutas pueden modularizarse usando express.Router() y separarse en archivos diferentes.",
          },
          {
            name: "Middleware",
            order: 2,
            content: "El middleware en Express son funciones que tienen acceso a los objetos request (req), response (res) y la siguiente funcion middleware en el ciclo request-response (next). El middleware puede ejecutar codigo, modificar request y response, finalizar el ciclo request-response, o llamar al siguiente middleware con next(). El middleware de aplicacion se aplica globalmente con app.use() y se ejecuta en cada peticion. El middleware de ruta se aplica solo a rutas especificas. Express.json() es middleware que parsea bodies JSON y lo hace disponible en req.body. Express.urlencoded() parsea datos de formularios URL-encoded. El middleware personalizado se crea como funciones con la firma (req, res, next): pueden validar datos, autenticar usuarios, logear peticiones, manejar errores, etc. El orden de definicion es crucial: el middleware se ejecuta en el orden en que se define con use(). El middleware de manejo de errores tiene cuatro parametros (err, req, res, next) y debe definirse despues de todas las rutas. Ejemplos comunes incluyen cors(), morgan() para logging, y helmet() para seguridad.",
          },
          {
            name: "API REST completa",
            order: 3,
            content: "REST (Representational State Transfer) es un estilo arquitectonico para diseñar APIs que usan HTTP. Las operaciones CRUD (Create, Read, Update, Delete) se mapean a metodos HTTP: POST para crear recursos, GET para leerlos, PUT o PATCH para actualizarlos, y DELETE para eliminarlos. Una API RESTful usa URIs para identificar recursos (/api/users/123) y codigos de estado HTTP para comunicar resultados: 200 OK para exito, 201 Created tras crear un recurso, 204 No Content para deletes exitosos, 400 Bad Request para errores del cliente, 401 Unauthorized para autenticacion fallida, 404 Not Found cuando el recurso no existe, 500 Internal Server Error para errores del servidor. Las APIs REST deben ser stateless: cada peticion contiene toda la informacion necesaria, sin depender de estado en el servidor. Los recursos deben tener URLs coherentes y predecibles. El manejo de errores debe ser consistente: usar try-catch para capturar excepciones, enviar respuestas JSON con mensajes descriptivos, y usar codigos de estado apropiados. Middleware de error centralizado permite manejar todos los errores consistentemente. La validacion de entrada es crucial para seguridad y consistencia de datos.",
          },
        ],
      },
    ],
  },
  {
    title: "SQL para desarrolladores",
    resume: "Consultas, joins, indices y modelado relacional aplicado a proyectos reales.",
    price: 39.99,
    topicDescriptions: ["SQL", "Backend"],
    levels: [
      {
        name: "Fundamentos de SQL",
        description: "Bases de datos relacionales y consultas basicas",
        order: 1,
        units: [
          {
            name: "Introduccion a bases de datos",
            order: 1,
            content: "Una base de datos relacional organiza la informacion en tablas relacionadas entre si mediante claves. Cada tabla representa una entidad (usuarios, productos, pedidos) y contiene filas (registros individuales) y columnas (atributos o campos). Los tipos de datos SQL mas comunes incluyen: INTEGER para numeros enteros, DECIMAL/NUMERIC para numeros con decimales, VARCHAR para texto de longitud variable, TEXT para textos largos, DATE para fechas, TIMESTAMP para fecha y hora, y BOOLEAN para valores verdadero/falso. La clave primaria (PRIMARY KEY) es una columna o conjunto de columnas que identifica unicamente cada fila en una tabla; no puede contener valores NULL ni duplicados. Las claves foraneas (FOREIGN KEY) establecen relaciones entre tablas: una columna en una tabla que referencia la clave primaria de otra tabla, manteniendo la integridad referencial. Por ejemplo, una tabla 'pedidos' puede tener una clave foranea 'usuario_id' que referencia la clave primaria 'id' en la tabla 'usuarios'. Las restricciones (constraints) como NOT NULL, UNIQUE, CHECK y DEFAULT permiten mantener la calidad y consistencia de los datos.",
          },
          {
            name: "SELECT y filtrado",
            order: 2,
            content: "La clausula SELECT es fundamental en SQL para recuperar datos de una base de datos. SELECT * retorna todas las columnas, mientras que SELECT columna1, columna2 retorna solo columnas especificas. La clausula WHERE filtra filas segun condiciones: WHERE edad > 18 retorna solo registros que cumplen la condicion. Los operadores de comparacion incluyen =, !=, <, >, <=, >=, BETWEEN (rango inclusivo), IN (coincidencia con lista de valores), y LIKE para patrones de texto (% representa cualquier secuencia, _ un caracter). Se pueden combinar condiciones con AND, OR y NOT. ORDER BY ordena resultados: ORDER BY nombre ASC ordena ascendentemente (por defecto), DESC ordena descendentemente; se pueden especificar multiples columnas para ordenamiento compuesto. LIMIT restringe el numero de filas retornadas, util para paginacion: LIMIT 10 retorna las primeras 10 filas. OFFSET permite saltar filas: LIMIT 10 OFFSET 20 retorna filas 21-30. DISTINCT elimina duplicados retornando valores unicos. Se pueden usar alias con AS para renombrar columnas en el resultado: SELECT nombre AS name FROM usuarios.",
          },
          {
            name: "Funciones agregadas",
            order: 3,
            content: "Las funciones agregadas realizan calculos sobre conjuntos de filas y retornan un unico valor. COUNT() cuenta filas: COUNT(*) cuenta todas las filas incluyendo NULL, COUNT(columna) cuenta valores no NULL en esa columna. SUM() suma valores numericos, AVG() calcula el promedio, MIN() encuentra el valor minimo, y MAX() encuentra el maximo. Estas funciones son particularmente potentes con GROUP BY, que agrupa filas con valores identicos en columnas especificadas: SELECT categoria, COUNT(*) FROM productos GROUP BY categoria cuenta productos por categoria. Se pueden agrupar por multiples columnas. HAVING filtra grupos despues de la agregacion (WHERE filtra antes): HAVING COUNT(*) > 5 retorna solo grupos con mas de 5 filas. Es comun combinar agregaciones: SELECT ciudad, AVG(salario), COUNT(*) FROM empleados GROUP BY ciudad HAVING AVG(salario) > 50000 muestra ciudades con salario promedio superior a 50000. Las agregaciones pueden incluir expresiones: SUM(precio * cantidad) calcula totales. Se pueden combinar con ORDER BY para ordenar resultados agregados.",
          },
        ],
      },
      {
        name: "Consultas avanzadas",
        description: "JOINs, subconsultas e indices",
        order: 2,
        units: [
          {
            name: "JOINS",
            order: 1,
            content: "Los JOINS combinan filas de dos o mas tablas basandose en una condicion relacionada entre ellas, tipicamente mediante claves foraneas. INNER JOIN retorna solo filas que tienen coincidencias en ambas tablas: SELECT * FROM pedidos INNER JOIN usuarios ON pedidos.usuario_id = usuarios.id retorna pedidos con su informacion de usuario correspondiente. LEFT JOIN (o LEFT OUTER JOIN) retorna todas las filas de la tabla izquierda y las coincidencias de la derecha; si no hay coincidencia, las columnas de la derecha seran NULL. RIGHT JOIN hace lo opuesto. FULL OUTER JOIN retorna todas las filas de ambas tablas, con NULL donde no hay coincidencias (no soportado en MySQL, pero si en PostgreSQL). Los joins multiples permiten combinar mas de dos tablas: encadenar multiples JOIN para relacionar pedidos -> usuarios -> direcciones. Los self joins unen una tabla consigo misma, util para jerarquias: SELECT e.nombre, m.nombre AS manager FROM empleados e LEFT JOIN empleados m ON e.manager_id = m.id. Las condiciones de join pueden ser mas complejas que solo igualdad. Es importante entender el impacto en rendimiento: joins sobre columnas indexadas son mas rapidos.",
          },
          {
            name: "Subconsultas",
            order: 2,
            content: "Una subconsulta es una consulta SELECT anidada dentro de otra consulta. Las subconsultas en WHERE filtran basandose en resultados de otra consulta: SELECT * FROM productos WHERE precio > (SELECT AVG(precio) FROM productos) retorna productos mas caros que el promedio. Las subconsultas en FROM crean tablas temporales: SELECT categoria, avg_precio FROM (SELECT categoria, AVG(precio) as avg_precio FROM productos GROUP BY categoria) AS promedios. Las subconsultas en SELECT calculan valores para cada fila: SELECT nombre, (SELECT COUNT(*) FROM pedidos WHERE usuario_id = usuarios.id) AS total_pedidos FROM usuarios. El operador IN verifica si un valor existe en el resultado de una subconsulta: WHERE id IN (SELECT usuario_id FROM pedidos). EXISTS retorna true si la subconsulta retorna al menos una fila, mas eficiente que IN para grandes datasets. Las subconsultas correlacionadas referencian columnas de la consulta externa y se evaluan para cada fila: SELECT * FROM productos p WHERE precio > (SELECT AVG(precio) FROM productos WHERE categoria = p.categoria). Los operadores ANY y ALL comparan con subconsultas: precio > ALL (subconsulta) verifica que sea mayor que todos los valores.",
          },
        ],
      },
    ],
  },
];

export class CourseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    try {
      console.log('Iniciando CourseSeeder...');
      const topicByDescription = new Map<string, Topic>();

      // Crear topics
      for (const description of TOPIC_DESCRIPTIONS) {
        let topic = await em.findOne(Topic, { description });
        if (!topic) {
          topic = em.create(Topic, { description });
          em.persist(topic);
          console.log(`Topic creado: ${description}`);
        } else {
          console.log(`Topic existente: ${description}`);
        }
        topicByDescription.set(description, topic);
      }

      await em.flush();

      // Crear cursos con levels y units
      for (const courseData of COURSES_DATA) {
        const existingCourse = await em.findOne(Course, { title: courseData.title });
        if (existingCourse) {
          console.log(`Curso ya existe: ${courseData.title}`);
          continue;
        }

        console.log(`Creando curso: ${courseData.title}`);
        const course = em.create(Course, {
          title: courseData.title,
          resume: courseData.resume,
          price: courseData.price,
          isActive: true,
          createdAt: new Date(),
        });

        courseData.topicDescriptions.forEach((topicDescription) => {
          const topic = topicByDescription.get(topicDescription);
          if (topic) course.topics.add(topic);
        });

        // Crear levels y units para el curso
        for (const levelData of courseData.levels) {
          const level = em.create(Level, {
            name: levelData.name,
            description: levelData.description,
            order: levelData.order,
            course: course,
          });

          for (const unitData of levelData.units) {
            const unit = em.create(Unit, {
              name: unitData.name,
              order: unitData.order,
              content: unitData.content,
              level: level,
            });
            level.units.add(unit);
          }

          course.levels?.add(level);
        }

        em.persist(course);
        await em.flush();
        console.log(`Curso creado exitosamente: ${courseData.title}`);
      }

      console.log('CourseSeeder completado');
    } catch (error) {
      console.error('Error en CourseSeeder:', error);
      throw error;
    }
  }
}

