# Healenium SerenityBDD y guión

## ¿What is Selenium Grid?
[Selenium Grid](https://www.selenium.dev/documentation/grid/getting_started/) is a powerful tool designed to facilitate the parallel execution of Selenium tests across multiple machines and browsers simultaneously. It allows for efficient testing of web applications by distributing test execution across different environments, thereby reducing test execution time and increasing test coverage.
## ¿How it works?
**Selenium Grid** is a part of the Selenium Suite that allows you to run your tests on different machines against different browsers in **parallel**. It operates by having a central Hub that receives test requests and then uses Nodes to execute these tests across various browser and system environments.

Here’s a simplified explanation of how it works:

**Hub**: The central point that manages the test network. It receives the test requests.

**Nodes**: These are the machines that are registered with the hub. They actually run the tests on different browsers.
When a test is initiated, the hub will look for a node that matches the criteria of the test (like browser version, platform, etc.) and then sends the test to that node.
The node runs the test and sends the results back to the hub.

This setup allows for parallel execution of tests, which can greatly reduce the time needed for running extensive test suites. It’s particularly useful for **cross-browser** and **cross-platform testing**, ensuring that applications work consistently across different environments.

## Proyecto base
Este proyecto base incorpora Healenium y utiliza Gradle, Java con SerenityBDD y el patrón de diseño Screenplay.

## Requisitos previos
- [IDEA JetBrains IntelliJ](https://www.jetbrains.com/idea/)

- [Docker Desktop](https://www.docker.com/products/docker-desktop)

- [Java 11](https://www.oracle.com/co/java/technologies/javase/jdk11-archive-downloads.html)

- [Gradle Wrapper 8.0](https://docs.gradle.org/current/userguide/upgrading_version_7.html)

## ¿Cómo ejecutar este proyecto base?
### Iniciando el backend de Healenium
1. Primero, asegúrese de que Docker esté en funcionamiento.

2. en la raiz del proyecto se debe crear el directorio "***healenium/db/sql***" y añadir el archivo ***init.sql***

#### init.sql
```sql
CREATE SCHEMA healenium AUTHORIZATION healenium_user;
GRANT USAGE ON SCHEMA healenium TO healenium_user;
```

3. en el directorio ***healenium/*** creamos un archivo ***docker-compose.yaml*** y guardamos

```yaml
version: "3.9"

services:

  postgres-db:
    image: postgres:11-alpine
    container_name: postgres-db
    restart: always
    ports:
      - "5432:5432"
    volumes:
      - ./db/sql/init.sql:/docker-entrypoint-initdb.d/init.sql
    environment:
      - POSTGRES_DB=healenium
      - POSTGRES_USER=healenium_user
      - POSTGRES_PASSWORD=YDk2nmNs4s9aCP6K
    networks:
      - healenium

  healenium:
    image: healenium/hlm-backend:3.3.0
    container_name: healenium
    restart: on-failure
    ports:
      - "7878:7878"
    links:
      - postgres-db
    environment:
      - SPRING_POSTGRES_DB=healenium
      - SPRING_POSTGRES_SCHEMA=healenium
      - SPRING_POSTGRES_USER=healenium_user
      - SPRING_POSTGRES_PASSWORD=YDk2nmNs4s9aCP6K
      - SPRING_POSTGRES_DB_HOST=postgres-db
      - KEY_SELECTOR_URL=false
      - COLLECT_METRICS=true
      - HLM_LOG_LEVEL=info
    volumes:
      - ./screenshots/:/screenshots
    networks:
      - healenium

  selector-imitator:
    image: healenium/hlm-selector-imitator:1.1
    container_name: selector-imitator
    restart: on-failure
    ports:
      - "8000:8000"
    networks:
      - healenium

networks:
  healenium:
    name: healenium
```

2. Abra un símbolo del sistema o una terminal en el directorio "***healenium***" y ejecute:

***`docker-compose up -d`***

![imagen](https://user-images.githubusercontent.com/9147189/138021369-c61c225b-1d1c-4a55-940c-229d124e899f.png)

3. Espere a que Docker descargue las imágenes y finalice la configuración.

4. Usando la interfaz de usuario de Docker Desktop, verifique que los contenedores de base de datos y backend de Healenium se estén ejecutando.

![imagen](https://user-images.githubusercontent.com/9147189/137907488-635861d4-f68a-4e00-83df-3fcb4fffe849.png)

O puede ejecutar ***`docker ps`*** y comprobarlo.

### Integrando Healenium en las pruebas
En el caso particular de SerenityBDD con Screenplay, se deben implementar un par de clases funcionales e implementar un metodo con la anotación ***`@Before`*** en el ***`StepDefinitions`***, esto con el fin de instanciar el actor con el WebDriver de auto-curado. basicamente, todo lo que se requiere es envolver el WebDriver en el nuevo SelfHealingDriver.

El ***`build.gradle`*** de base que tenemos hasta el momento:

```groovy
group 'BaseWebHealeniumSP'
version '1.0'
apply plugin: 'java-library'
apply plugin: 'java'
apply plugin: 'groovy'
apply plugin: "net.serenity-bdd.serenity-gradle-plugin"


sourceCompatibility = '11'
targetCompatibility = '11'
def versionSerenity='4.0.12'
def versionHealeniumWeb='3.4.4'
def versionCucumber='4.0.12'
def versionApachePoi='5.2.2'
compileJava.options.encoding = "UTF-8"
compileTestJava.options.encoding = "UTF-8"


repositories {
    mavenCentral()
    maven {
        url 'https://pkgs.dev.azure.com/DEV-FormacionCH/f11a2ddb-f565-44a3-8710-e9e1472d29ee/_packaging/Choucair/maven/v1'
    }

}

buildscript {
    repositories {
        maven {
            url "https://plugins.gradle.org/m2/"
        }
    }
    dependencies {
        classpath "net.serenity-bdd:serenity-gradle-plugin:4.0.12"
        classpath "com.epam.healenium:hlm-report:1.1.2"
    }
}

apply plugin: "com.epam.healenium.hlm-report"

dependencies {

    //DEPENDENCIAS WEB SERENITYBDD
    implementation "net.serenity-bdd:serenity-core:${versionSerenity}"
    implementation "net.serenity-bdd:serenity-junit:${versionSerenity}"
    implementation "net.serenity-bdd:serenity-ensure:${versionSerenity}"
    implementation "net.serenity-bdd:serenity-cucumber:${versionCucumber}"
    implementation "net.serenity-bdd:serenity-screenplay:${versionSerenity}"
    implementation "net.serenity-bdd:serenity-report-resources:${versionSerenity}"
    implementation "net.serenity-bdd:serenity-screenplay-webdriver:${versionSerenity}"

    //DEPENDENCIAS DE UTILIDAD
    implementation "io.cucumber:datatable:${versionCucumber}"
    testImplementation "io.cucumber:cucumber-junit:${versionCucumber}"
    implementation "org.apache.poi:poi:${versionApachePoi}"
    implementation "org.apache.poi:poi-ooxml:${versionApachePoi}"
    implementation 'org.junit.jupiter:junit-jupiter:5.8.1'
    testImplementation 'org.junit.jupiter:junit-jupiter-api:5.8.2'
    implementation group: 'org.apache.commons', name: 'commons-collections4', version: '4.4'
    implementation group: 'org.slf4j', name: 'slf4j-api', version: '2.0.0-alpha5'
    implementation group: 'org.slf4j', name: 'slf4j-simple', version: '2.0.0-alpha5'
    implementation group: 'org.apache.logging.log4j', name: 'log4j-core', version: '2.18.0'
    implementation group: 'com.oracle.database.jdbc', name: 'ojdbc8', version: '21.3.0.0'
    implementation group: 'org.assertj', name: 'assertj-core', version: '3.8.0'
    implementation group: 'org.hamcrest', name: 'hamcrest-all', version: '1.3'
    implementation group: 'net.sf.jt400', name: 'jt400', version: '10.6'
    compileOnly 'org.projectlombok:lombok:1.18.24'
    annotationProcessor 'org.projectlombok:lombok:1.18.24'

    // Healenium
    implementation "com.epam.healenium:healenium-web:${versionHealeniumWeb}"
    implementation 'org.testng:testng:7.7.0'
    implementation 'io.qameta.allure:allure-java-commons:2.11.0'
   // implementation 'io.github.bonigarcia:webdrivermanager:5.4.1'
    implementation 'com.github.javafaker:javafaker:1.0.2'

    //LIBRERIAS CHOUCAIR
    implementation(group: 'com.choucair', name: 'libreria', version: '1.0.1')

}

test {
    useJUnit {
        include "**/*";
        gradle.startParameter.continueOnFailure = true
        testLogging.showStandardStreams = true
        systemProperties System.getProperties()
        //systemProperties project.properties.subMap(["browser"])
        systemProperty "cucumber.filter.tags", System.getProperty("cucumber.filter.tags")
    }
}

```

crea el paquete drivers junto a los paquetes de tasks, userinterfaces, interactions etc. En este paquete se deberan crear las siguientes clases

#### DriverFactory.java

```java
public class DriverFactory {

    public static WebDriver getNewInstance(String browserName) {
        switch (browserName.toLowerCase()) {
            case "chrome-headless":
                ChromeOptions chromeOptions = new ChromeOptions();
                chromeOptions.addArguments("--headless");
                chromeOptions.addArguments("start-maximized");
                WebDriverManager.chromedriver().setup();
                return new ChromeDriver(chromeOptions);
            case "firefox":
                WebDriverManager.firefoxdriver().setup();
                return new FirefoxDriver();
            case "firefox-headless":
                FirefoxBinary firefoxBinary = new FirefoxBinary();
                firefoxBinary.addCommandLineOptions("--headless");
                firefoxBinary.addCommandLineOptions("--window-size=1280x720");
                FirefoxOptions firefoxOptions = new FirefoxOptions();
                firefoxOptions.setBinary(firefoxBinary);
                WebDriverManager.firefoxdriver().setup();
                return new FirefoxDriver(firefoxOptions);
            case "edge":
                WebDriverManager.edgedriver().setup();
                return new EdgeDriver();
            default:
                ChromeOptions options =new ChromeOptions();
                options.addArguments("start-maximized");
                options.addArguments("--allow-running-insecure-content --disable-popup-blocking --disable-dev-shm-usage");
                options.addArguments("--disable-infobars --test-type --disable-extensions --disable-translate");
                options.addArguments("--ignore-certificate-errors --no-sandbox --disable-download-notification");
                WebDriverManager.chromedriver().setup();
                return new ChromeDriver(options);
        }
    }
}
```
#### DriverHolder.java

```java

import org.openqa.selenium.WebDriver;

public class DriverHolder {
    private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();
    public static WebDriver getDriver() {
        return driver.get();
    }
    public static void setDriver(WebDriver driver) {
        DriverHolder.driver.set(driver);
    }

}
```

Una vez tenemos estas clases creadas procedemos a crear la clase Hooks.java y alli implementaremos el siguiente metodo con la anotacion @Before

**Metodo de implementacion:**

```java
import io.cucumber.java.Before;
import org.openqa.selenium.WebDriver;
import net.serenitybdd.core.Serenity;
import com.epam.healenium.SelfHealingDriver;
import net.serenitybdd.screenplay.actors.Cast;
import net.serenitybdd.screenplay.abilities.BrowseTheWeb;
import org.openqa.selenium.WebDriver;

public class Hooks {
   @Before
    public void setup() {
        /* se instancia el navegador y se configura el WebDriver para los Screenshots del reporte*/
        WebDriver delegate = DriverFactory.getNewInstance("chrome"); // en esta linea seleccionamos el navegador entre Chrome, Firefox o Edge
        setDriver(delegate);
        Serenity.getWebdriverManager().setCurrentDriver(delegate);
        /* se instancia el WebDriver con la clase SelHealingDriver con el fin de hacer el Wrap necesario para activar el auto-curado*/
        WebDriver selfHealingDriver = SelfHealingDriver.create(delegate);
        setDriver(selfHealingDriver);
        /* Se instancia el escenario con el WebDriver Personalizado para el auto-curado */
        OnStage.setTheStage(Cast.whereEveryoneCan(BrowseTheWeb.with(selfHealingDriver)));
    }
}
```



### Ejecutando las pruebas
Inicialmente la prueba debe ejecutarse exitosamente, con el fin de almacenar los elementos del DOM usados en la prueba, una vez sea exitosa, tenemos los elementos de referencia para futuras comparaciones en caso de un cambio en los elementos idetnficados, el ***NoSuchElementException*** actua como un trigger y en tiempo de ejecucion se realiza el auto-curado.

Para realizar una prueba de auto-curado, se debe identificar los elementos a modificar en la prueba y utilizar un ***breakpoint*** en la linea donde se encuentra el selector a curar y ejecutamos la prueba en modo ***debug***

una vez el IDE entre en modo debug y visualizamos el sitio web en pausa, procederemos a editar el HTML en las herramientas de desarrollador y eliminamos o editamos el atributo que apunta nuestro selector y resumimos la prueba.

normalmente, esto causaria que los localizadores fallen debido a que no se encuentra el elemento, en este caso, la prueba se auto-curará debido al driver wrapped con SelfHealing.

![imagen](https://user-images.githubusercontent.com/9147189/137924473-815e8470-bf57-4a8c-9d62-53fb6e62dad4.png)

El localizador ha sido identificado, curado y la acción se ha realizado correctamente, como lo indican los cuadros rojos.

Supongamos que desea ajustar Healenium para incluir un límite de puntuación o intentos de recuperación. En tal escenario, cree un archivo llamado "***healenium.properties***" y colóquelo en el directorio de recursos de prueba ("***src/test/resources***"). El siguiente es el contenido del archivo:

```
recovery-tries = 2
score-cap = 0.6
heal-enabled = true
screenshotStrategy=ALL
serverHost = localhost
serverPort = 7878
imitatePort=8000
```

**recovery-tries** - Numero de veces que el algoritmo intentara descubrir un selector funcional

**score-cap** - El puntaje minimo requerido para que el localizador sea aceptado(50% es representado en decimal 0.5).

**heal-enabled** - Habilita o desahabilita la propiedad de auto-curado

**serverHost** - La URL del servidor con el container de Docker mientras configuramos el Backend

**serverPort** - El puerto del servidor mencionado arriba.

### Reportes

al finalizar la ejecucion, en la consola observamos dos enlaces generados con los reportes, el reporte de auto-curado y el reporte regular de SerenityBDD

![image](https://user-images.githubusercontent.com/9147189/137932747-b879f236-dbad-4db6-9f32-71922a08864d.png)

Cuando abre el enlace en un navegador, obtendrá una lista de todos los localizadores que se han corregido, junto con capturas de pantalla de la página donde se han corregido los localizadores. En el lado derecho, hay un interruptor para ver si el localizador se ha resuelto correctamente con el correcto.

cuando se abre el enlace en el navegador, podemos visualizar el sitio del reporte de autocurado con los selectores fallidos y curados y su respectiva captura de pantalla.

![image](https://user-images.githubusercontent.com/9147189/137934653-59a69eb5-954e-4fee-b475-c74c34ade9fc.png)

Al instalar el complemento Healenium IDE, puede habilitar la función de actualización automática del localizador en IntelliJ IDEA. Puede hacer clic derecho en los localizadores que desea corregir y seleccionar Resultados de curación. Verás una pequeña ventana con una lista de localizadores fijos para elegir, junto con su puntuación correspondiente.

![image](https://user-images.githubusercontent.com/9147189/137936516-f7ef7087-06d5-44f5-8ead-feb57a63fb6f.png)


Este readme.md fue construido y publicado por Michael Garzon Rodriguez
Automatizador
Choucair Testing
email: mgarzonr@choucairtesting.com
cel: 304 326 1092
