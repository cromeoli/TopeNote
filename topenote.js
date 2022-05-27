// IMPORTS & CONSTANTES
const rs = require('readline-sync');
const fs = require("fs");
const xs = require('xml2js');
const { parse } = require('path');
var parseXML = new xs.Parser();
var builder = new xs.Builder();
var currentDate = new Date(); 
var datetime =  currentDate.getDate() + "/"
                + (currentDate.getMonth()+1)  + "/" 
                + currentDate.getFullYear() + " Hora: "  
                + currentDate.getHours() + ":"  
                + currentDate.getMinutes() + ":" 
                + currentDate.getSeconds();
////////////////////////////////////////////////////////////////////////////////

/*Función que consiste en un switch que llama a 
  a las funcionalidades de la aplicación
  en base al entero que se le pase.*/
function switchOptions(command){
    switch(command){
        case 0: insertNote(); break;
        case 1: printNotes(); break;
        case 2: modifyNote(); break;
        case 3: searchNote(); break;
        case -1:   exit();    break;
    }
}
////////////////////////////////////////////////////////////////////////////////
/*Función con la que empieza el programa,
  dibuja un encabezado simple y muestra las acciones
  posibles. Llama a la función "switchOptions" pasándole
  el input del usuario como parámetro*/
function begin(){
    console.log('\n    █████████████████████████')
    console.log('    ██                     ██')
    console.log('    ██      TOPE NOTE      ██')
    console.log('    ██                     ██')
    console.log('    █████████████████████████')

    console.log(`\nBienvenid@ a Tope Note: `)
    console.log(`Sesion: ${datetime}\n`)
    console.log('¿Qué desea hacer hoy?')

    const options = ['Nueva nota', 'Imprimir notas', 'Modificar nota', 'Buscar nota']
    let command = rs.keyInSelect(options, 'Comando: ', {guide: false, cancel: 'Salir'})

    switchOptions(command)
}

/////////////////////////////////////////////////////////////////////////////////////
/* Esta función añade una nota al XML, transformando el fichero notas.xml 
   primero a JSON insertando los datos, y transformando de nuevo a XML 
   para actualizar notas.xml */
function insertNote(){
    console.log('INSERTAR UNA NOTA')

    let title    = rs.question("Titulo: ")
    let body     = rs.question( "Cuerpo: ")

    fs.readFile('notas.xml', "utf-8",function(error, data) 
    { if (error) { throw error;}
        else
        // xml2js: XML -> JSON
        parseXML.parseString(data, function (error, result) {
            if (error) { throw error; }

            const noteElements = {
                id: parseInt(result.notas.nota.at(-1).id) + 1,
                titulo: title,
                cuerpo:body,
                fechaHora:datetime
            };

            result.notas.nota.push(noteElements);  //Pushea la nota al JSON
            var xml = builder.buildObject(result); // xml2js: JSON -> XML

            fs.writeFile("notas.xml", xml, (error) => {
                if (error) {console.log("\nError en la escritura de la nota."); throw error;}
                else
                console.log("\nÉxito en la creación de la nota");
                begin()
            });
        });
    });

    
}
////////////////////////////////////////////////////////////////////////////////////////
/*Esta función transforma lee los datos mediante la libreria fs 
  y los transforma a JSON para poder iterarlos e imprimirlos*/
function printNotes(){
    console.log('IMPRESION DE TODAS LAS NOTAS \n')
    fs.readFile('notas.xml', "utf-8",function(error, data) 
    {   if (error) { throw error;}
        else

        // Llamo al parser de xml2js definido en los imports para convertir el XML a JSON
        parseXML.parseString(data, function (error, result) {
            if (error) { throw error; }

            // Iteramos los datos del JSON recien convertido y los formateamos con
            // console.log() para hacerlos más visuales
            result.notas.nota.forEach(function (label)
            {
            console.log("════════════════════════════════════");
            console.log(`ID Nota: ${label.id}`);
            console.log(`Titulo: ${label.titulo}`);
            console.log(`Cuerpo:\n   ${label.cuerpo}`);
            console.log(`Fecha y hora: ${label.fechaHora}`);
            console.log("════════════════════════════════════");
            }
          );
        });
    });
}

////////////////////////////////////////////////////////////////////////////////////////
/*Función que modifica una nota en función de un ID introducido por
  input, dando a elegir entre modificar título o cuerpo.  */
function modifyNote(){
    let modify = 0
    let match = false
    const labels = ['Titulo', 'Cuerpo']

    console.log('MENU DE MODIFICACIÓN DE NOTA')

    let noteID  = rs.question("Introduce el ID de la nota que quieres modificar: ")
    let chooseLabel = rs.keyInSelect(labels, '¿Que deseas modificar? ', {guide: false, cancel: 'Cancelar'})
    
    switch(chooseLabel){
        case 0: modify = 0; break;
        case 1: modify = 1; break;
        case -1: 
            console.log('Modificación cancelada. Volviendo al menú')
            begin();    
            break;
    }
    
    fs.readFile('notas.xml', function(error, data) {
        if (error) { throw error;}

        parseXML.parseString(data, function (error, result) {
            if (error) { throw error; }

            result.notas.nota.forEach(function (label){

            if(noteID == label.id){
                if(modify == 0){
                    match = true
                    let newTitle = rs.question('Nuevo titulo para la nota: ')
                    label.titulo = newTitle;
                }
                else {
                    match = true
                    let newBody = rs.question('Nuevo cuerpo para la nota: ')
                    label.cuerpo = newBody;
                };
                };
            });

            if(match == false){ console.log('El id no existe o es inválido. Volviendo al menú')
                                begin()}
            
            var xml = builder.buildObject(result);
    
            fs.writeFile("notas.xml", xml, function(error) {
            if (error) console.log(error); 
            else console.log("Nota modificada con éxito")});
        });
      });
}

////////////////////////////////////////////////////////////////////////////////////////
/* Funcion que busca un string dado por input tanto en el cuerpo como
   el título de la nota, si lo encuentra, imprime la nota.*/
function searchNote(){
    console.log('BÚSQUEDA')

    fs.readFile('notas.xml', "utf-8",function(error, data){
        if (error) { throw error;}
        else
        // Llamo al parser de xml2js definido en los imports para convertir el XML a JSON
        parseXML.parseString(data, function (error, result) {
            if (error) { throw error; }

            // Iterar y buscar en titulo y en cuerpo.
            let keyword = rs.question('Parametro a buscar: ').toLowerCase()
            result.notas.nota.forEach(function (label)
            {
            if(JSON.stringify(label.titulo).toLowerCase().includes(keyword)){
                console.log("════════════════════════════════════");
                console.log(`ID Nota: ${label.id}`);
                console.log(`Titulo: ${label.titulo}`);
                console.log(`Cuerpo:\n   ${label.cuerpo}`);
                console.log(`Fecha y hora: ${label.fechaHora}`);
                console.log("════════════════════════════════════");
            }
            else if(JSON.stringify(label.cuerpo).toLowerCase().includes(keyword)){
                console.log("════════════════════════════════════");
                console.log(`ID Nota: ${label.id}`);
                console.log(`Titulo: ${label.titulo}`);
                console.log(`Cuerpo:\n   ${label.cuerpo}`);
                console.log(`Fecha y hora: ${label.fechaHora}`);
                console.log("════════════════════════════════════");
            }
            }
          );
        });
    });
    
}
////////////////////////////////////////////////////////////////////////////////////////
function exit(){
    console.log('Saliendo... ¿Ninguna nota hoy? ¡Mejor, menos trabajo!')
    process.exit()
}

////////////////////////////////////////////////////////////////////////////////////////
//Inicio del programa
begin()




