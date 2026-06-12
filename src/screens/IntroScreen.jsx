import { useEffect, useRef, useState } from "react";
import { Dimensions, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { colors } from "@/theme/colors";






const slides = [
{
  color: "#FFE24E",
  title: "Hmmm, Healthy food",
  desc: "A variety of foods made by the best chef. Ingredients are easy to find, all delicious flavors can only be found here",
  image: require("../../images/introimages/image1.png"),
  skip: true
},
{
  color: "#A3E4F1",
  title: "Fresh Drinks, Stay Fresh",
  desc: "We provide clear healthy drink options for you. Fresh taste always accompanies you",
  image: require("../../images/introimages/image2.png"),
  skip: true
},
{
  color: "#31B77A",
  title: "Let's Cook",
  desc: "Are you ready to make a dish for your friends or family? let's get started :)",
  image: require("../../images/introimages/image3.png"),
  skip: false
}];


export function IntroScreen({ onLogin, onSignup }) {
  const [phase, setPhase] = useState("splash");
  const [index, setIndex] = useState(0);
  const scrollRef = useRef(null);
  const width = Dimensions.get("window").width;

  useEffect(() => {
    const timer = setTimeout(() => setPhase("intro"), 1200);
    return () => clearTimeout(timer);
  }, []);

  if (phase === "splash") {
    return (
      <View style={styles.splash}>
        <View style={styles.splashLogoWrap}>
          <Image source={require("../../images/introimages/Logo (1).png")} style={styles.splashLogo} resizeMode="contain" />
        </View>
        <Text style={styles.splashTitle}>Nutrio</Text>
      </View>);

  }

  if (phase === "welcome") {
    return (
      <View style={styles.welcome}>
        <View style={styles.welcomeImageWrap}>
          <Image source={require("../../images/introimages/image1.png")} style={styles.welcomeImage} resizeMode="contain" />
        </View>
        <Text style={styles.welcomeTitle}>Welcome to Nutrio</Text>
        <Text style={styles.welcomeText}>Your personalized health companion.{"\n"}Track, analyze, and improve your life.</Text>
        <View style={styles.welcomeButtons}>
          <Button onPress={onSignup}>Get Started</Button>
          <Button variant="ghost" onPress={onLogin}>I already have an account</Button>
        </View>
      </View>);

  }

  function next() {
    if (index < slides.length - 1) {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
    } else {
      setPhase("welcome");
    }
  }

  return (
    <View style={[styles.intro, { backgroundColor: slides[index].color }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => setIndex(Math.round(event.nativeEvent.contentOffset.x / width))}>
        
        {slides.map((slide) =>
        <View key={slide.title} style={[styles.slide, { width, backgroundColor: slide.color }]}>
            <Image source={slide.image} style={styles.heroImage} resizeMode="cover" />
          </View>
        )}
      </ScrollView>
      <View style={styles.bottomSheet}>
        <Text style={styles.slideTitle}>{slides[index].title}</Text>
        <Text style={styles.slideDesc}>{slides[index].desc}</Text>
        <View style={styles.dots}>
          {slides.map((slide, dotIndex) =>
          <View
            key={slide.title}
            style={[styles.dot, index === dotIndex && styles.dotActive, index === dotIndex && { backgroundColor: slides[index].color }]} />

          )}
        </View>
        <View style={styles.introActions}>
          {slides[index].skip ?
          <>
              <Pressable onPress={() => setPhase("welcome")} style={styles.skipButton}>
                <Text style={styles.skipText}>Skip Now</Text>
              </Pressable>
              <Pressable onPress={next} style={[styles.roundNext, { backgroundColor: slides[index].color }]}>
                <Text style={styles.roundNextText}>→</Text>
              </Pressable>
            </> :

          <Pressable onPress={() => setPhase("welcome")} style={[styles.getStarted, { backgroundColor: slides[index].color }]}>
              <Text style={styles.continueText}>Get Started</Text>
            </Pressable>
          }
        </View>
      </View>
    </View>);

}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  splashLogoWrap: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 4
  },
  splashLogo: {
    width: 62,
    height: 62
  },
  splashTitle: {
    marginTop: 20,
    color: colors.primaryDark,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 1.5
  },
  intro: {
    flex: 1
  },
  slide: {
    flex: 1,
    alignItems: "center"
  },
  heroImage: {
    width: "100%",
    height: "58%"
  },
  bottomSheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: "46%",
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 100,
    paddingHorizontal: 45,
    paddingTop: 62,
    paddingBottom: 20
  },
  slideTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "900",
    textAlign: "center"
  },
  slideDesc: {
    color: colors.textMuted,
    fontSize: 18,
    lineHeight: 27,
    marginTop: 16,
    textAlign: "center"
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 22
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#F4F4F4"
  },
  dotActive: {
    width: 42,
    height: 6,
    borderRadius: 50
  },
  introActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 24
  },
  skipButton: {
    minWidth: 120,
    height: 54,
    alignItems: "center",
    justifyContent: "center"
  },
  skipText: {
    color: colors.primaryDark,
    fontWeight: "900"
  },
  roundNext: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center"
  },
  roundNextText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 38,
    lineHeight: 44
  },
  getStarted: {
    flex: 1,
    height: 54,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  continueText: {
    color: "#FFFFFF",
    fontWeight: "900"
  },
  welcome: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 30,
    paddingVertical: 28,
    justifyContent: "center"
  },
  welcomeImageWrap: {
    height: 270,
    alignItems: "center",
    justifyContent: "center"
  },
  welcomeImage: {
    width: "100%",
    height: "100%"
  },
  welcomeTitle: {
    marginTop: 22,
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    textAlign: "center"
  },
  welcomeText: {
    marginTop: 10,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center"
  },
  welcomeButtons: {
    marginTop: 46,
    gap: 12
  }
});
