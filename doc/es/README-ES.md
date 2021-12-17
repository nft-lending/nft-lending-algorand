# Subasta de Préstamos NFT
 
## Introducción
 
Esta es una aplicación descentralizada para prestar tókenesno fungibles (NFT). La interfaz web está escrita para su implementación en IPFS. Como tal, se puede cargar como contenido estático y no depende de ningún servicio activo. El back-end es un contrato inteligente que se ejecuta en la cadena de bloques ALgorand.
 
Esta aplicación permite que tanto el prestatario como el prestamista participe en finanzas descentralizadas (DeFi) dentro y fuera de esta aplicación.
 
En una subasta, los posibles prestamistas compiten por la mejor oferta para el prestatario. El Borroser usa su NFT como garantía para el préstamo, para recibir fondos que pueden participar en otros protocolos DeFi.
 
## Préstamos No Fungibles
 
El uso de garantías fungibles en los préstamos DeFi fue una de las primeras ofertas. Por lo general, el prestatario garantiza una garantía cuyo valor se espera que aumente. Contra esa garantía, el prestatario obtiene un activo más estable, que se espera sea más fácil de reembolsar. Los fondos prestados se pueden poner a trabajar en otros protocolos DeFi. Para el prestamista, el beneficio reside en la tasa de interés que se cobra por los activos prestados. Los prestamistas pueden elegir entre varios protocolos de préstamos para optimizar su rendimiento. Por ejemplo, uno de los primeros y más grandes protocolos de préstamos DeFi es AAVE:
 
![Fungible Lending](AAVE%203D.jpg)
 
Esto es muy conveniente para utilizar activos fungibles como garantía. Sin embargo, si el prestatario tiene activos fungibles líquidos, el motivo para obtener un préstamo en contra de eso no es muy intuitivo.
 
Una casa, por ejemplo, no es fungible. Puede representarse como NFT. AAVE espera una garantía fungible, ya que es fácil de tratar "a granel" sin prestar especial atención a cada préstamo. Una garantía no fungible no funcionaría allí:
 
![Non-Fungible Collateral](AAVE%20Fail%203D.jpg)
 
Es por eso que necesitamos un protocolo para préstamos con garantía no fungible:
 
![NFT Lending](NFT%20LENDING%203D.jpg)
 
La forma más sencilla de hacer esto sería **encontrar una manera de que el Prestatario y el Prestamista se emparejen de alguna manera** y decidan los términos. Luego, pueden ingresar un contrato inteligente de depósito en garantía simple para lograr el trato sin confianza. Sin confianza significa sin necesidad de confianza: todo lo que cualquiera debe confiar es que el Smart Contract se comportará según lo programado, y asegurar que este sea el trabajo principal de la cadena de bloques con capacidad para Smart Contract como Algorand.
 
En lugar de enviar al Prestamista y al Prestatario a otro lugar, para encontrarse, un DApp amigable les permitiría quedarse y encontrarse sin tener que ir a otra parte. Para lograrlo, DApp ofrece una subasta:
 
![AUCTION](AUCTION%203D.jpg)
 
## Implementación
 
La aplicación descentralizada (DApp) utiliza la cadena de bloques Algorand, así como una interfaz web, accesible a través de Internet.
 
La lógica empresarial de la aplicación se implementa como contrato inteligente de Algorand.
 
La interfaz se ejecuta en el navegador del usuario como código JavaScript. Este código sirve como contenido estático de IPFS (Inter-Planetary File System) y, como tal, es inmutable y no es propenso a ataques de modificación de código de front-end.
 
### Implementación y ciclo de vida de uso
 
El siguiente diagrama muestra la implementación y la vida útil de la aplicación.
 
![Proceso de Desarrollo y Uso](Proceso%20de%20Desarrollo%20y%20Uso.png)
 
En la primera columna, los contratos escritos en PyTeal se compilan en código TEAL comprensible por Algorand y se implementan en la cadena de bloques.
 
En la segunda columna, el front-end, escrito en JavaScript y usando React, js-algorand-sdk y las API de billetera, está empaquetado e implementado en IPFS. El registro DNS se actualiza para reflejar la URL de IPFS, por lo que el usuario puede acceder a la aplicación por su nombre de dominio. En el futuro, además de DNS, se utilizará el servicio de nombres Ethereum Naming Service (ENS) o Unstopable Domains.
 
En la tercera columna, el usuario puede acceder a DApp utilizando un navegador. El navegador solicita el código JavaScript alojado en IPFS y apuntado por DNS como contenido estático. Este código luego accede a la cadena de bloques de Algorand y usa las billeteras de Algorand para firmar transacciones antes de enviarlas al nodo de Algorand más cercano.
 
En particular, el costo de la red de Algorand es relativamente bajo. Esto permite que el Prestatario implemente una nueva instancia del Contrato Inteligente para cada NFT puesto como garantía y cree una subasta para ello. Cuando finaliza la subasta, comienza el préstamo, y cuando finaliza el préstamo, ya sea con reembolso o liquidación, el Smart Contract puede ser destruido.
 
La subasta se rige en cadena, ya que las bajas tarifas de la red también lo permiten.
 
### Flujo de trabajo
 
El proceso de préstamos NFT se describe a continuación:
 
![Protocolo DApp](Protocolo%20DApp.png)
 
- El Prestatario establece la subasta ofreciendo su NFT y poniéndolo en el Contrato Inteligente de Subasta como garantía. Los parámetros iniciales son la duración de la subasta, la fecha límite para el reembolso del préstamo, el monto prestado, el monto máximo de reembolso aceptable, la disminución mínima de la oferta (factor de la diferencia anterior entre los dos parámetros anteriores).
- Los prestamistas potenciales comienzan a ofertar por el monto de reembolso máximo aceptable y compiten licitando montos de reembolso más bajos. Al final de la subasta, el postor ganador es el que ofrece el monto de reembolso más bajo. A medida que los posibles prestamistas pujan, depositan los fondos que se tomarán prestados en el contrato inteligente. Cuando llega una nueva oferta ganadora junto con un depósito, al postor superado se le reembolsa su depósito de inmediato.
- Una vez finalizada la subasta, comienza el préstamo. El Prestatario puede pedir prestados los fondos inmediatamente, retirándolos del Contrato Inteligente.
- Si el Prestatario paga el préstamo a tiempo antes de la fecha límite, recupera su NFT, mientras que los fondos de reembolso van inmediatamente al Prestamista.
- Si el Prestatario no paga el préstamo a tiempo, entra en incumplimiento, después de lo cual el Prestamista puede liquidar el préstamo y recibir el NFT depositado como garantía.
 
Entonces, ¿por qué el Prestatario no realiza pagos, como en los préstamos bancarios regulares? No es necesario reembolsar mientras se mantiene la garantía bloqueada; esto es solo un riesgo adicional. En cambio, el Prestatario puede invertir sus fondos en otras partes de DeFi y ganar dinero extra.
 
Aquí está el momento de los eventos. Inicialmente hay una subasta de préstamos:
 
![Subasta de Préstamos](Subasta%20de%20Préstamos.png)
 
Hay dos posibles resultados: reembolso o liquidación satisfactorios.
 
Reembolso:
 
![Pago de Prestamo](Pago%20de%20Prestamo.png)
 
El propietario deposita el NFT junto con los términos. El prestamista acepta los términos y presta el dinero en forma de un token de Algorand ASA. Una vez que el propietario paga la deuda determinada en los términos, el NFT se devuelve al propietario.
 
Liquidación:
 
![Préstamo Liquidación](Préstamo%20Liquidación.png)
 
Si el NFT no paga la deuda a tiempo dentro del plazo, a solicitud del prestamista, el NFT se transfiere al prestamista como parte del proceso de liquidación.
 
## Más Trabajo
 
Además de la capacidad para establecer subastas, se desarrollará un Smart Contract publicitario de subastas en cadena. De esta manera los Prestatarios y Prestamistas pueden reunirse en DApp, sin haber estado en contacto previamente de ninguna manera.
