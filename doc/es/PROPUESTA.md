#  Propuesta por el proyecto de Algorand LatAm Hackathon - Equipo Hija y Padre

## Introducción

Estamos implementando una aplicación de préstamos hipotecarios descentralizada Non-Fungible Token (NFT). Suponemos que un NFT puede ser un activo valioso, que puede ser utilizado como garantía para obtener un préstamo.

En un proyecto diferente hemos encapsulado acuerdos legales como NFT, como títulos de propiedad, arrendamientos de automóviles, etc.
 
Ahora estamos permitiendo que el usuario deposite esos NFT como garantía y obtenga activos fungibles contra ellos. Esos activos fungibles se pueden implementar aún más en varios protocolos de cultivo de rendimiento DeFi, o usarse fuera de la cadena de bloques para otros fines.
 
## Implementación
 
La aplicación descentralizada (DApp) utiliza la cadena de bloques Algorand, así como una interfaz web, accesible a través de Internet.
 
La lógica empresarial de la aplicación se implementa como contrato inteligente de Algorand.
 
La interfaz se ejecuta en el navegador del usuario como código JavaScript. Este código sirve como contenido estático de IPFS (Inter-Planetary File System) y, como tal, es inmutable y no es propenso a ataques de modificación de código de front-end.
 
### Ciclo de vida de implementación y uso
 
El siguiente diagrama muestra la implementación y la vida útil de la aplicación.
 
![Ciclo vital](Proceso%20de%20Desarrollo%20y%20Uso.png)
 
En la primera columna, los contratos escritos en PyTeal se compilan en código TEAL comprensible por Algo y se implementan en la cadena de bloques.
 
En la segunda columna, el front-end, escrito en JavaScript y usando React, js-algorand-sdk y las API de billetera, está empaquetado e implementado en IPFS. El registro DNS se actualiza para reflejar elURL de IPFS, por el cual el usuario puede acceder a la aplicación por su nombre de dominio. En el futuro, además de DNS, se utilizará el servicio de nombres Ethereum Naming Service (ENS) o Unstopable Domains.
 
En la tercera columna, el usuario puede acceder a la DApp utilizando un navegador. El navegador solicita el código JavaScript alojado en IPFS y apuntado por DNS como contenido estático. Este código luego accede a la cadena de bloques de Algorand y usa las billeteras de Algorand para firmar transacciones antes de enviarlas al nodo de Algorand más cercano.
 
#### Flujo de trabajo
 
El proceso de préstamos NFT se describe a continuación:
 
![Protocolo DApp](Protocolo%20DApp.png)
 
Hay dos resultados posibles: reembolso o liquidación exitosos:
 
![Pago de Prestamo](Pago%20de%20Prestamo.png)
 
El propietario deposita el NFT junto con los términos. El prestamista acepta los términos y presta el dinero en forma de un token de Algorand ASA. Una vez que el propietario paga la deuda determinada en los términos, el NFT se devuelve al propietario.
 
![Préstamo Liquidación](Préstamo%20Liquidación.png)
 
Si el NFT no paga la deuda a tiempo dentro del plazo, a solicitud del prestamista, el NFT se transfiere al prestamista como parte del proceso de liquidación.
 
## Más trabajo
 
Si el tiempo lo permite, estamos implementando una subasta para encontrar el prestamista más competitivo. Los prestamistas compiten en una subasta por el monto de reembolso más bajo del préstamo. Al final de la subasta, el proponente más competitivo puede proporcionar el préstamo garantizado por el NFT del propietario.
