#!/usr/bin/env node

// Récuperations de tout les modules qu'on utilise
const inquirer = require('inquirer')
const program = require('commander')
const fs = require ('fs')
var sqlite3 = require('sqlite3').verbose();
var file = "CLI.db";
var db = new sqlite3.Database(file);


// Création d'une liste option auquel les élements ce réaliseront que si on execute la commande
program
	.option('-A, --adhesion', 'Insert un nouveau membre!')
	.option('-S, --AffichageBDD', 'Affichage de la BDD!')
	.option('-E, --ExtractMember','Extrait les données d un membre!')
	.option ('-M, --mail','Extrait les données d un membre!')

program.parse(process.argv)

// Ajout d'un membre dans la BDD


if (program.adhesion){
  
 //appel la function dialogValidation
  dialogValidation()
} 



// Récupération de l'information dans la BDD en fesant correspondre chaque élements de la table (nom, prenom, password) pour les informations stockés correspondent




// Affichage de la BDD si l'administrateur souhaite voir l'ensemble de ses adhérents

if (program.AffichageBDD){

  db.serialize(function () {

    db.all("SELECT * FROM personne", function (err, tables) {

      console.log(tables)})
  })}
  
  if (program.ExtractMember){
	 exportPersonne()
	 
  
}



  
  




if (program.mail){
	
	var nodemailer = require('nodemailer');
	
	inquirer.prompt([
		{
			type: 'input',
			message: 'Nom et prenom: ',
			name: 'pN'
		},
		{
			type: 'input',
			message: 'mail de la personne: ',
			name: 'pE'
		}
  ]).then((answer) => {
	
	var tab = answer.pN.split(" ")
	var nom = tab[0]
	var prenom = tab[1]
	getPersonneInfo(prenom, nom).then((personne) => {
console.log(personne+" "+nom+" "+prenom)
	    var Mtext = '\n\n\n\n\nName: '+nom+'\n\n prenom : '+prenom +"\n\n password:" + personne.password
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport('smtps://mailnodjs@gmail.com:123azerty@smtp.gmail.com');

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"Fred Foo 👥" <foo@blurdybloop.com>', // sender address
    to: answer.pE, // list of receivers
    subject: 'Hello ✔', // Subject lineS
    text: Mtext// plaintext body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
	})	
})}
	
	
	// Creation de la table personne ou seront stockés tout les informations personnel d'un adhérent. Si la tables est déjà créer cette action s'annule d'ou le IF NOT EXISTS
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS personne (nom TEXT, prenom TEXT, password TEXT)");
});
	
	// Fonction Ajout d'un membre
	function insert(nom, prenom, password){

	db.serialize(function () {

  		return db.run('INSERT INTO personne (nom, prenom, password)VALUES ("'+nom+'", "'+prenom+'", "'+password+'")') 
  })
  

    
  
  
}
	// Fonction de dialogue ajout d'un membre
	
	function dialogValidation(){
// Proposition à l'utilisateur de la console d'ajouté un membre
	 inquirer.prompt([
		{
			type: 'list',
			message: 'Vous voulez ajouter un nouveau membre?',
			name: 'option',
			choices: [
				'yes',
				'no'
			]
		}
  ]).then((answer) => {
// Si l'utilisateur clique "yes" le script va faire appel à la fonction add
	if (answer.option == 'yes'){

	  add()
	}else{
// En cas d'ajout d'un membre la commande et rejeté
	  console.log('Ok pas de problème!')
	}
  })
}


// Fonction exportation de la personne dans un fichier son nom.prenom
function exportPersonne(){
	
	

	    inquirer.prompt([
		{
			type: 'input',
			message: 'Ecrire le prenom et le nom de la personne: ',
			name: 'personne'
		}
  	    ]).then((answer) => {

  	    	var nomP=answer.personne

  	    	var tab = nomP.split(" ")
			var prenom = tab[0]
			var nom = tab[1]

  	    	exportP(prenom, nom)

  	    })
}

// Fonction informations des personnes

function getPersonneInfo(prenom, nom){
	
	return new Promise((resolve, reject)=>{

    db.serialize(function () {
//console.log(nom+" "+ prenom)
      db.get("SELECT * FROM personne WHERE prenom='"+prenom+"' AND nom='"+nom+"' ", function (err, personne) {
//console.log(personne)
      	resolve(personne)
      })
    })
  })
}

// Appel de la fonction add qui vas ajouté des informations de la personne via une liste de questions.
function add(){

	 inquirer.prompt([
		{
			type: 'input',
			message: 'Nom de la personne: ',
			name: 'pN'
		},
		{
			type: 'input',
			message: 'Prenom de la personne: ',
			name: 'pP'
		},
		{
			type: 'input',
			message: 'Password de la personne: ',
			name: 'pPass'
		}
  ]).then((answer) => {

  	insert(answer.pN, answer.pP, answer.pPass)
  })
}

// Fonction export prenom et non pour écire un fichier
  function exportP(prenom, nom){

	 try{

	getPersonneInfo(prenom, nom).then((personne) => {
//console.log(personne)
	    var text = '\n\n\n\n\nName: '+personne.nom+'\n\n prenom : '+personne.prenom +" password:" + personne.password
//console.log(text)
	    //Ecrire un fichier
	    fs.writeFile(personne.nom+'_'+personne.prenom+'.txt', text,(err) =>{
		  if (err) throw err
			  console.log('Recipe exported at '+__dirname)
	    })
	  })

	}catch (err){

	console.error('ERR > ',err)
  }
  }
	
	 
